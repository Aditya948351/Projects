"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const UploadDoc = () => {
  const [document, setDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!document) {
      setError("Please upload the PDF first.");
      return;
    }

    if (document.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", document);

    try {
      const res = await fetch("/api/quizz/generate/", {
        method: "POST",
        body: formData,
      });

      if (res.status === 200) {
        const data = await res.json();
        const quizzId = data.quizzId;
        router.push(`/quizz/${quizzId}`);
      } else {
        setError("Failed to generate quiz. Please try again.");
      }
    } catch (e) {
      console.error("Error while generating:", e);
      setError("Something went wrong. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <p>Generating Quiz For You... Be Patient!</p>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <label
            htmlFor="document"
            className="bg-secondary w-full flex h-20 rounded-md border-4 border-dashed border-blue-900 relative"
          >
            <div className="absolute inset-0 m-auto flex justify-center items-center">
              {document ? document.name : "Drag or upload a PDF file here"}
            </div>
            <input
              type="file"
              id="document"
              accept="application/pdf"
              className="relative block w-full h-full z-50 opacity-0"
              onChange={(e) => {
                const file = e?.target?.files?.[0];
                if (file && file.type === "application/pdf") {
                  setDocument(file);
                  setError("");
                } else {
                  setDocument(null);
                  setError("Only PDF files are allowed.");
                }
              }}
            />
          </label>
          {error && <p className="text-red-600 mt-1">{error}</p>}
          <Button size="lg" className="mt-2" type="submit">
            Generate Quiz
          </Button>
        </form>
      )}
    </div>
  );
};

export default UploadDoc;
