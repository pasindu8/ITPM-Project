function Footer() {
  // මේකෙන් දැනට තියෙන අවුරුද්ද ඉබේම ලබාගන්නවා
  const currentYear = new Date().getFullYear();

  return (
    // mt-auto නිසා පිටුවේ අන්තර්ගතය අඩු වුණත් Footer එක යටටම වෙලා තියෙනවා
    <footer className="w-full mt-auto py-6 bg-black backdrop-blur-md border-t border-white/10 flex flex-col items-center justify-center">
        <p className="text-white/60 text-sm font-medium tracking-wide">
            &copy; {currentYear}. All Rights Reserved. 
            <span className="text-blue-400/80 font-bold ml-1 hover:text-blue-400 cursor-pointer transition-colors">
                Developed by ITPM
            </span>
        </p>
        
        {/* අමතර ලස්සනකට පොඩි ඉරි කෑල්ලක් (Optional) */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-3 rounded-full"></div>
    </footer>
  );
}

export default Footer;