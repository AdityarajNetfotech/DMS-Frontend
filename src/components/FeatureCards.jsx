import { CheckCircle2 } from "lucide-react";

const cards = [
  "AI Semantic Search",
  "Intelligent OCR",
  "E2E Encryption",
  "Automated Classification",
];

export default function FeatureCards() {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-5">
        Enabled Features
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((item) => (
          <div
            key={item}
            className="border rounded-xl p-5 flex justify-between"
          >
            <span>{item}</span>

            <CheckCircle2
              className="text-green-500"
              size={20}
            />
          </div>
        ))}
      </div>
    </div>
  );
}