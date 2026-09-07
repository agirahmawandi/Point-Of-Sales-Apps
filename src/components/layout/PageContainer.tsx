import React, { type ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, description, actions, children }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-both">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#254222] tracking-tight">{title}</h1>
          {description && <p className="text-[14px] text-[#45464d] mt-1">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageContainer;
