const FreeButton = ({ href }: { href: string }) => {
  return (
    <a
      href={href}
      className="h-[48px] px-[24px] py-[16px] bg-[#6366F1] rounded-[10px] shadow-lg flex flex-row items-center justify-center w-fit cursor-pointer"
    >
      <p className="text-white text-[16px] font-bold cursor-pointer select-none">
        Get Started Now
      </p>
    </a>
  );
};

export default FreeButton;
