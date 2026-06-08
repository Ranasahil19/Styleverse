const OpenAI = require("openai");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_IMAGE_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL ||
  "sourceful/riverflow-v2.5-pro:free";
const OPENROUTER_SITE_URL =
  process.env.OPENROUTER_SITE_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "StyleVerse";

const isDataUrl = (value) =>
  /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value || ""));

const normalizeOpenRouterError = (error) => {
  const raw =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.error?.message ||
    error.message ||
    "OpenRouter try-on failed";
  const status = error.response?.status || error.status || 500;
  const lower = String(raw).toLowerCase();

  if (status === 401 || lower.includes("auth") || lower.includes("api key")) {
    return {
      status,
      message:
        "OpenRouter API key is missing or invalid. Check OPENROUTER_API_KEY in backend .env.",
      code: "OPENROUTER_API_KEY_INVALID",
    };
  }

  if (
    status === 402 ||
    lower.includes("credit") ||
    lower.includes("insufficient")
  ) {
    return {
      status,
      message:
        "OpenRouter credits or free model quota are not available for this request.",
      code: "OPENROUTER_CREDITS_UNAVAILABLE",
      details: {
        model: OPENROUTER_IMAGE_MODEL,
      },
    };
  }

  if (status === 429 || lower.includes("rate limit") || lower.includes("quota")) {
    return {
      status,
      message:
        "OpenRouter rate limit or free model quota was reached. Please wait and try again.",
      code: "OPENROUTER_RATE_LIMITED",
      details: {
        model: OPENROUTER_IMAGE_MODEL,
      },
    };
  }

  if (lower.includes("model") || lower.includes("not found")) {
    return {
      status,
      message:
        "OpenRouter image model is unavailable. Check OPENROUTER_IMAGE_MODEL in backend .env.",
      code: "OPENROUTER_MODEL_UNAVAILABLE",
      details: {
        model: OPENROUTER_IMAGE_MODEL,
      },
    };
  }

  return {
    status,
    message:
      String(raw).length > 220
        ? "OpenRouter AI try-on failed. Please try again."
        : raw,
    code: "OPENROUTER_TRYON_FAILED",
  };
};

const buildTryOnPrompt = ({ category, productName }) =>
  [
    "Create a realistic e-commerce virtual try-on image.",
    "Use the first image as the customer photo and the second image as the exact product.",
    `Product name: ${productName || "Selected product"}.`,
    `Product category: ${category}.`,
    "Preserve the customer's identity, face, pose, skin tone, background, and camera framing.",
    "Place only the selected product onto the customer with realistic scale, perspective, shadows, and occlusion.",
    "Do not change the product color, texture, logo, or design.",
    "For normal clear eyeglasses, keep lenses transparent so the user's eyes are visible and only the frame is prominent.",
    "For sunglasses, keep the dark/tinted lenses visible.",
    "For clothing, fit the item naturally to shoulders, chest, and torso without covering the face.",
    "Return only the final edited image. Do not add text, labels, watermarks, borders, or extra products.",
  ].join(" ");

const extractOpenRouterImage = (data) => {
  const message = data?.choices?.[0]?.message;
  const imageUrl = message?.images?.[0]?.image_url?.url;
  const contentImage = Array.isArray(message?.content)
    ? message.content.find((part) => part.type === "image_url")?.image_url?.url
    : null;

  return imageUrl || contentImage || null;
};

const isModalityEndpointError = (error) => {
  const raw =
    error.response?.data?.error?.message ||
    error.error?.message ||
    error.message ||
    "";

  return String(raw).toLowerCase().includes("output modalities");
};

const getOpenRouterImage = async ({ prompt, userImage, productImage }) => {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": OPENROUTER_SITE_URL,
        "X-Title": OPENROUTER_APP_NAME,
    },
    timeout: 120000,
  });
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "image_url",
          image_url: {
            url: userImage,
          },
        },
        {
          type: "image_url",
          image_url: {
            url: productImage,
          },
        },
      ],
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: OPENROUTER_IMAGE_MODEL,
      messages,
      modalities: ["image", "text"],
    });

    return extractOpenRouterImage(response);
  } catch (error) {
    if (!isModalityEndpointError(error)) {
      throw error;
    }

    const response = await client.chat.completions.create({
      model: OPENROUTER_IMAGE_MODEL,
      messages,
      modalities: ["image"],
    });

    return extractOpenRouterImage(response);
  }
};

const handleAiTryOn = async (req, res) => {
  try {
    const { userImage, productImage, category, productName } = req.body || {};

    if (!isDataUrl(userImage) || !isDataUrl(productImage) || !category) {
      return res.status(400).json({
        error: "Missing userImage, productImage, or category",
      });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENROUTER_API_KEY in backend .env",
        code: "OPENROUTER_API_KEY_MISSING",
      });
    }

    const resultImage = await getOpenRouterImage({
      prompt: buildTryOnPrompt({ category, productName }),
      userImage,
      productImage,
    });

    if (!resultImage) {
      return res.status(502).json({
        error: "OpenRouter did not return an image",
        code: "OPENROUTER_NO_IMAGE",
      });
    }

    res.json({ resultImage });
  } catch (error) {
    const normalized = normalizeOpenRouterError(error);

    console.error("Error in /api/ai-tryon:", normalized.message);
    res.status(normalized.status).json({
      error: normalized.message,
      code: normalized.code,
      details: normalized.details,
    });
  }
};

module.exports = {
  handleAiTryOn,
};
