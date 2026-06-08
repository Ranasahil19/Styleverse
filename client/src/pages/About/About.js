import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Member1 from "../../assets/audit-client.png"
import Member2 from "../../assets/images.jpg"
import { FiHeadphones, FiShield, FiTruck } from "react-icons/fi";

const AboutPage = () => {
  return (
    <div className="max-w-container mx-auto px-4 pb-16 text-gray-800">
      <Breadcrumbs title="About Us" prevLocation="/" />
      <section className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">StyleVerse</p>
        <h1 className="mt-2 text-4xl font-extrabold text-gray-950">About Our Store</h1>
        <p className="text-base leading-7 mt-4 max-w-3xl mx-auto text-gray-600">
          Your one-stop destination for quality products, seamless shopping, and
          excellent customer service.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950">Our Mission & Vision</h2>
        <p className="mt-4 text-gray-600 leading-7">
          We strive to bring the best products to your doorstep with an easy and
          reliable shopping experience. Our goal is to create a trusted
          community of buyers and sellers worldwide.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-violet-50 text-violet-600">
              <feature.icon />
            </div>
            <h3 className="text-xl font-bold text-gray-950">{feature.title}</h3>
            <p className="text-gray-600 mt-2 leading-6">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950 mb-6">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamData.map((member, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50 p-6 text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 mx-auto rounded-full mb-4 border-4 border-gray-300"
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-950 mb-6">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50 p-6"
            >
              <p className="text-gray-600 italic">"{review.text}"</p>
              <h4 className="font-semibold mt-4">- {review.author}</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "Fast & Secure Shipping",
    description: "We ensure quick delivery with secure packaging.",
    icon: FiTruck,
  },
  {
    title: "Quality Assurance",
    description: "Every product is tested for quality before shipment.",
    icon: FiShield,
  },
  {
    title: "24/7 Customer Support",
    description: "Our team is here to help you at any time.",
    icon: FiHeadphones,
  },
];

const teamData = [
  {
    name: "Alice Johnson",
    role: "CEO",
    image: Member1,
  },
  {
    name: "Mark Wilson",
    role: "CTO",
    image: Member2,
  },
  {
    name: "Emice Brown",
    role: "Marketing Head",
    image: Member1,
  },
];

const reviews = [
  { text: "Amazing quality and service!", author: "John Doe" },
  { text: "Fast delivery and great support.", author: "Jane Smith" },
];

export default AboutPage;
