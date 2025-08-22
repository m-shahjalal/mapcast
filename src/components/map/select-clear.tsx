import { Eraser } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryParams } from "@/hooks/use-query";

export const ClearSelection = () => {
  const { clearParams } = useQueryParams();
  return (
    <div className="flex items-center gap-2 min-w-0 w-full sm:w-[200px] flex-1">
      <Button
        className="w-fit h-10 rounded-full backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 dark:focus:border-gray-700/50"
        onClick={() => clearParams("all")}
      >
        <Eraser className="h-3 w-3 mr-1" />
        <span className="hidden lg:inline"> Clear</span>
      </Button>
    </div>
  );
};
