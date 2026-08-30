import { useNavigate } from "react-router-dom";
import { MarketSelector } from "@/components/market/MarketSelector";
import { useApp } from "@/context/AppContext";
import type { MarketCategory } from "@/types";

export default function HomePage() {
  const navigate = useNavigate();
  const { addRecentMarket } = useApp();

  const handleSelect = (symbol: string, category: MarketCategory) => {
    addRecentMarket(symbol);
    navigate(`/market/${encodeURIComponent(symbol)}`, {
      state: { category },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <MarketSelector onSelect={handleSelect} />
    </div>
  );
}
