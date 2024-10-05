"use client";
import React from 'react'
import { useState, useCallback, useEffect } from "react";
import { MapPin, Upload, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import { Libraries } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  createReport,
  createUser,
  getRecentReports,
  getUserByEmail,
} from "@/utils/db/action";
import { report } from "process";

const geminiApiKey = process.env.GEMINI_API_KEY as any;
// console.log("gemini", geminiApiKey);
const googleMapsAPiKey = process.env.GOOGLE_MAPS_API_KEY as any;
// console.log("Google Map", googleMapsAPiKey);

const libraries: Libraries = ["places"];

export default function ReportPage() {
  //for current user
  const [user, setUser] = useState("") as any;
  const router = useRouter();

  //to display current reports
  const [reports, setReports] = useState<
    Array<{
      id: number;
      location: string;
      wasteType: string;
      amount: string;
      createdAt: string;
    }>
  >([]);

  //to create new reports
  const [newReports, setNewReports] = useState({
    location: "",
    type: "",
    amount: "",
  });

  //to handel file upload
  const [file, setFile] = useState<File | null>(null);

  //to preview the file that uploade
  const [preview, setPreview] = useState<string | null>(null);

  const [userId, setUserId] = useState() as any;

  //to set waste Verfication Status
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");

  //to get waste verification result its meaning verify the upload file has which type quantity and ai confidence
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: string;
    confidence: number;
  } | null>(null);

  //to handel submit report
  const [isSubmitting, setIsSubmitting] = useState(false);

  //this is for google map search box
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);

  // handel to load google map api
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleMapsAPiKey!,
    libraries: libraries,
  });

  //use to set seaarch box refrence means get location from goole map api
  //Initializes the search box when the map is loaded.
  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  //to handel place selection from seacrh box and update the location on report
  const onPlaceChange = () => {
    if (searchBox) {
      // it give all places means if we seach india give all suggestion of places of that country
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        //to set locatin property in new report
        setNewReports((prev) => ({
          ...prev,
          location: place.formatted_address || "",
        }));
      }
    }
  };

  //to handel input of waste type location and  amount
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewReports({ ...newReports, [name]: value });
  };

  //to handel file upload and generate a prieview
  const handelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      //to read the uploaded file for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  //Gemini ai
  const handleVerify = async () => {
    // If no file is uploaded, exit the function early
    if (!file) return;

    // Set the verification status to "verifying" to indicate that the verification process has started
    setVerificationStatus("verifying");

    try {
      // Initialize the GoogleGenerativeAI with the Gemini API key
      const genAI = new GoogleGenerativeAI(geminiApiKey!);

      // Specify the model to be used for generative tasks, in this case, "gemini-1.5-flash"
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert the uploaded file to a base64 encoded string for processing
      const base64Data = await readFileAsBase64(file);

      // Create an object representing the image file in a format suitable for the API request
      const imageParts = [
        {
          inlineData: {
            // Extract the actual base64 data from the file, removing the prefix
            data: base64Data.split(",")[1],
            // Include the file's MIME type (e.g., image/png, image/jpeg)
            mimeType: file.type,
          },
        },
      ];

      // Create the prompt for the Gemini AI model, asking it to analyze the uploaded image.
      // The AI will return the type of waste, estimated quantity, and its confidence level.
      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
        1. The type of waste (e.g., plastic, paper, glass, metal, organic)
        2. An estimate of the quantity or amount (in kg or liters)
        3. Your confidence level in this assessment (as a percentage)
        
        Respond in JSON format like this:
        {
          "wasteType": "type of waste",
          "quantity": "estimated quantity with unit",
          "confidence": confidence level as a number between 0 and 1
        }`;

      // Generate the content using the AI model by sending the prompt and the image parts
      const result = await model.generateContent([prompt, ...imageParts]);

      // Get the response from the model
      const response = await result.response;

      // Convert the response into text format
      const text = response.text();

      try {
        // Parse the response text into JSON format to extract the waste analysis data
        const parsedResult = JSON.parse(text);

        // Check if the parsed result contains valid data for waste type, quantity, and confidence
        if (
          parsedResult.wasteType &&
          parsedResult.quantity &&
          parsedResult.confidence
        ) {
          // If the data is valid, update the verification result state with the parsed data
          setVerificationResult(parsedResult);

          // Set the verification status to "success" since the process completed successfully
          setVerificationStatus("success");

          // Update the newReports state with the verified waste type and quantity
          setNewReports({
            ...newReports,
            type: parsedResult.wasteType,
            amount: parsedResult.quantity,
          });
        } else {
          // If the result does not contain valid data, log an error and set status to failure
          console.error("Invalid verification result:", parsedResult);
          setVerificationStatus("failure");
        }
      } catch (error) {
        // If parsing the response JSON fails, log the error and set the status to failure
        console.error("Failed to parse JSON response:", text);
        setVerificationStatus("failure");
      }
    } catch (error) {
      // If there is any error during the AI request or processing, log it and set status to failure
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
    }
  };

  //TO Submit new Report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== "success" || !user) {
      toast.error("Please verify the waste before submitting or log in.");
      return;
    }
    setIsSubmitting(true);
    try {
      const report = (await createReport(
        userId,
        newReports.location,
        newReports.type,
        newReports.amount,
        preview || undefined,
        verificationResult ? JSON.stringify(verificationResult) : undefined
      )) as any;
      const formatteReport = {
        id: report.id,
        location: report.location,
        wasteType: report.wasteType,
        amount: report.amount,
        createdAt: report.createdAt.toISOString().split("T")[0],
      };
      setReports([formatteReport, ...reports]);
      setNewReports({ location: "", type: "", amount: "" });
      setFile(null);
      setPreview(null);
      setVerificationStatus("idle");
      setVerificationResult(null);

      toast.success(
        `Report Sumbit SuccesFully! You've earned points for reporting waste`
      );
    } catch (e) {
      console.error(`Error submiting report `, e);
      toast.error("fail to submit please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  //TO Fetch A Report
  useEffect(() => {
    const checkUser = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        let user = getUserByEmail(email);
        setUser(user);

        user.then((data) => setUserId(data?.id));
        const recentReports = (await getRecentReports()) as any;
        const formattedReport = recentReports?.map((report: any) => ({
          ...report,
          createdAt: report.createdAt.toISOString().split("T")[0],
        }));
        setReports(formattedReport);
      } else {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);


  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Report waste
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg mb-12"
      >
        <div className="mb-8">
          <label
            htmlFor="waste-image"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Upload Waste Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors duration-300">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="waste-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="waste-image"
                    name="waste-image"
                    type="file"
                    className="sr-only"
                    onChange={handelFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="mt-4 mb-8">
            <img
              src={preview}
              alt="Waste preview"
              className="max-w-full h-auto rounded-xl shadow-md"
            />
          </div>
        )}

        <Button
          type="button"
          onClick={handleVerify}
          className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl transition-colors duration-300"
          disabled={!file || verificationStatus === "verifying"}
        >
          {verificationStatus === "verifying" ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Verifying...
            </>
          ) : (
            "Verify Waste"
          )}
        </Button>

        {verificationStatus === "success" && verificationResult && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Verification Successful
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Waste Type: {verificationResult.wasteType}</p>
                  <p>Quantity: {verificationResult.quantity}</p>
                  <p>
                    Confidence:{" "}
                    {(verificationResult.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            {isLoaded ? (
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlaceChange}
              >
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newReports.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  placeholder="Enter waste location"
                />
              </StandaloneSearchBox>
            ) : (
              <input
                type="text"
                id="location"
                name="location"
                value={newReports.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Enter waste location"
              />
            )}
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Waste Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={newReports.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified waste type"
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estimated Amount
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={newReports.amount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
              placeholder="Verified amount"
              readOnly
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </form>

      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Recent Reports
      </h2>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.wasteType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
