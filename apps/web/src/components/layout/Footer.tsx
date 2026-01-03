import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-google-grey/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg font-bold tracking-tight text-google-grey">
            GDG PCCOER
          </Link>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-500">
            &copy; 2025 All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/leaderboard" className="text-sm font-medium text-gray-500 hover:text-google-blue">
            Leaderboard
          </Link>
          <Link to="/rewards" className="text-sm font-medium text-gray-500 hover:text-google-blue">
            Rewards
          </Link>
          <a 
            href="https://gdg.community.dev/" 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm font-medium text-gray-500 hover:text-google-blue"
          >
            Community
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-400 hover:text-google-blue transition-colors">
            <Github className="h-4 w-4" />
          </a>
          <a href="#" className="text-gray-400 hover:text-google-blue transition-colors">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="text-gray-400 hover:text-google-blue transition-colors">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
