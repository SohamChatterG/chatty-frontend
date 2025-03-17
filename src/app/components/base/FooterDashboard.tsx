"use client";
import React from "react";

export function FooterDashboard() {
    return (
        <footer className="bg-black bg-opacity-60 text-white py-6 mt-10">
            <div className="container mx-auto flex flex-col items-center space-y-4 text-center">
                <p className="text-gray-400">© 2025 QuickChat. All Rights Reserved.</p>

                <div className="flex space-x-6">
                    <span className="hover:underline text-gray-300">Privacy Policy</span>
                    <span className="hover:underline text-gray-300">Terms of Service</span>
                    <span className="hover:underline text-gray-300">Contact</span>
                </div>

                <div className="flex space-x-4">
                    <a href="https://github.com/SohamChatterG" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                        GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/sohamchatterg/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                        LinkedIn
                    </a>
                </div>

                <p className="text-gray-400 text-sm">Version 1.0.3 | Last Updated: March 2025</p>
            </div>
        </footer>
    );
}

export default FooterDashboard;
