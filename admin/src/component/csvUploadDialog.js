import React, { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import api from "utils/axiosintance";

const CsvUploadDialog = ({ open, handleClose }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      alert("Please select a valid CSV file.");
      setCsvFile(null);
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await api.post("/upload-csv", formData);
      alert(response.data.message);
      setCsvFile(null);
      handleClose(); // Close dialog after success
    } catch (error) {
      alert("Error uploading CSV file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Product CSV</DialogTitle>
      <DialogContent>
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          id="upload-csv"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-csv">
          <IconButton component="span" color="primary">
            <CloudUpload fontSize="large" />
          </IconButton>
        </label>
        {csvFile && <Typography>{csvFile.name}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          color="primary"
          variant="contained"
          disabled={!csvFile || loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CsvUploadDialog;
