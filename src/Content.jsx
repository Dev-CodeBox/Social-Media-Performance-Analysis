import { useState } from "react";
import main from "./Insight";
import Markdown from "react-markdown";

function Content() {
  const [insights, setInsights] = useState("");
  const [isInsightLoading, setInsightLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setInsights("");
    setInsightLoading(true);

    const formData = new FormData(event.target);
    const inputValue = formData.get("post-type");

    try {
      const insightsData = await main(inputValue);
      setInsights(insightsData);
    } catch (error) {
      console.error("Error fetching insights:", error.message);
      window.alert("Failed to fetch insights. Please try again.");
    } finally {
      setInsightLoading(false);
    }
  }

  function getInsightsScreen() {
    if (insights) {
      return (
        <div className="animate-fadeIn p-4 text-gray-800 bg-white rounded-lg shadow-lg">
          <Markdown>{insights}</Markdown>
        </div>
      );
    } else if (isInsightLoading) {
      return (
        <div className="flex items-center justify-center min-h-full animate-pulse">
          <button
            disabled
            type="button"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C3.582 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Analyzing with AI...
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-center text-gray-500 animate-fadeIn">
          <p>No insights available. Please make a selection and submit.</p>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-4 sm:px-8 py-8">
      <div className="w-full max-w-4xl bg-white rounded-xl p-6 shadow-lg">
        {getInsightsScreen()}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-2xl mt-6"
      >
        <select
          name="post-type"
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg w-full sm:w-auto p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled>
            -- Select Post Type --
          </option>
          <option value="STATIC_IMG">Static Image</option>
          <option value="CAROUSEL">Carousel</option>
          <option value="REELS">Reels</option>
        </select>
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-transform duration-300 w-full sm:w-auto"
        >
          Get Insights
        </button>
      </form>
    </div>
  );
}

export default Content;
