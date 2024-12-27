// app/not-found.tsx
import fs from 'fs';
import path from 'path';
import React from 'react';


const NotFound: React.FC = () => {
    const filePath = path.join(process.cwd(), 'public', '404-2.html');
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
};

export default NotFound;
