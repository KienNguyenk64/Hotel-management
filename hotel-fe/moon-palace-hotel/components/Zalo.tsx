import React from "react";

const ZaloButton: React.FC = () => {
  const phoneNumber = "0366496756";

  return (
    <a
      href={`https://zalo.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-36 right-7 z-50 flex items-center justify-center w-14 h-14 bg-blue-500 rounded-full shadow-lg hover:scale-110 hover:bg-blue-600 transition-all duration-300"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
        alt="Zalo"
        className="w-8 h-8"
      />
    </a>
  );
};

export default ZaloButton;
