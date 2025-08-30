import { Spinner } from "@/components/ui/spinner";

export const SpinnerProvider = () => {
  return (
    <div className="fixed overflow-hidden top-0 right-0 left-0 bottom-0 z-[999999999999] flex justify-center items-center">
      <Spinner
        variant="default"
        className="w-10 h-10 bg-transparent dar:text-white"
      />
    </div>
  );
};

export default SpinnerProvider