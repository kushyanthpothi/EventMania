'use client';

import Link from 'next/link';
import { IoLogoFacebook, IoLogoTwitter, IoLogoInstagram, IoLogoLinkedin, IoMail, IoCall } from 'react-icons/io5';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-theme-surface text-theme transition-colors duration-300 border-t border-theme">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-4">
                            Event Mania
                        </h3>
                        <p className="text-theme-secondary text-sm">
                            Your ultimate platform for discovering and managing college events across India.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-theme">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="text-theme-secondary hover:text-indigo-500 transition-colors">Home</Link></li>
                            <li><Link href="/events" className="text-theme-secondary hover:text-indigo-500 transition-colors">Events</Link></li>
                            <li><Link href="/about" className="text-theme-secondary hover:text-indigo-500 transition-colors">About</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-theme">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-theme-secondary">
                                <IoMail />
                                <span>support@eventmania.com</span>
                            </li>
                            <li className="flex items-center gap-2 text-theme-secondary">
                                <IoCall />
                                <span>+91-XXXXXXXXXX</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-theme">Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="text-theme-secondary hover:text-indigo-500 transition-colors">
                                <IoLogoFacebook size={24} />
                            </a>
                            <a href="#" className="text-theme-secondary hover:text-indigo-500 transition-colors">
                                <IoLogoTwitter size={24} />
                            </a>
                            <a href="#" className="text-theme-secondary hover:text-indigo-500 transition-colors">
                                <IoLogoInstagram size={24} />
                            </a>
                            <a href="#" className="text-theme-secondary hover:text-indigo-500 transition-colors">
                                <IoLogoLinkedin size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-theme mt-8 pt-8 text-center text-sm text-theme-secondary">
                    <p>&copy; {currentYear} Event Mania. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

