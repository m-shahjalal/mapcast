import { IconSpinner } from "../ui/spinner";

export const SSRLoader = ({
  size = 100,
  rotationDuration = 800,
  pauseDuration = 300,
  className = "",
}) => {
  return (
    <div className="fixed left-0 top-0 right-0 bottom-0 flex justify-center items-center w-screen -z-50 bg-transparent">
      <IconSpinner
        rotationDuration={rotationDuration}
        pauseDuration={pauseDuration}
        size={size}
        className={className}
      />
    </div>
  );
};
