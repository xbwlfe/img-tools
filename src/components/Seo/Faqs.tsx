const Faqs = ({
  faq,
  title,
  description,
}: {
  faq: { question: string; answer: string }[];
  title?: string;
  description?: string;
}) => {
  return (
    <div className="flex items-center justify-center p-4 xl:p-5 gap-10 flex-col">
      <div>
        {title && <h2 className="section-title text-center">{title}</h2>}
        {description && (
          <p className="section-desc text-center mt-5">{description}</p>
        )}
      </div>
      <div className="w-full flex flex-col gap-[25px]">
        {faq.map(({ question, answer }) => (
          <div className="collapse rounded-[8px] bg-white" key={question}>
            <input type="checkbox" />
            <div className="collapse-title pr-[16px] text-[20px] text-[#181D27] font-medium font-bricolage flex items-center justify-between">
              {question}
              <div className="collapse-icon">
                <img
                  src="/images/faq-expanded.svg"
                  className="w-6 h-6 transition-opacity duration-200 collapse-icon-collapsed"
                />
                <img
                  src="/images/faq-collapsed.svg"
                  className="w-6 h-6 transition-opacity duration-200 collapse-icon-expanded"
                />
              </div>
            </div>
            <div className="collapse-content font-schibsted text-[16px] text-[#535862]">
              <p>{answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;
