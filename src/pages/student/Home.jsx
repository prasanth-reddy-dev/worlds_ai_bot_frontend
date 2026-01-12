import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../services/api';
import Footer from '../../components/Footer';

const Home = (props) => {
  const [companies, setCompanies] = useState([]);
  const [videos, setVideos] = useState([]);
  const [bootcamps, setBootcamps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const companiesScrollerRef = useRef(null);

  // Fallback Indian company logos - memoized to prevent recreation on every render
  const fallbackCompanies = useMemo(() => [
    { logo: 'https://logo.clearbit.com/tcs.com', companyName: 'TCS' },
    { logo: 'https://logo.clearbit.com/infosys.com', companyName: 'Infosys' },
    { logo: 'https://logo.clearbit.com/wipro.com', companyName: 'Wipro' },
    { logo: 'https://logo.clearbit.com/hcl.com', companyName: 'HCL' },
    { logo: 'https://logo.clearbit.com/techm.com', companyName: 'Tech Mahindra' },
    { logo: 'https://logo.clearbit.com/cognizant.com', companyName: 'Cognizant' },
    { logo: 'https://logo.clearbit.com/accenture.com', companyName: 'Accenture' },
    { logo: 'https://logo.clearbit.com/capgemini.com', companyName: 'Capgemini' },
    { logo: 'https://logo.clearbit.com/ibm.com', companyName: 'IBM' },
    { logo: 'https://logo.clearbit.com/oracle.com', companyName: 'Oracle' },
    { logo: 'https://logo.clearbit.com/microsoft.com', companyName: 'Microsoft' },
    { logo: 'https://logo.clearbit.com/google.com', companyName: 'Google' },
    { logo: 'https://logo.clearbit.com/amazon.com', companyName: 'Amazon' },
    { logo: 'https://logo.clearbit.com/flipkart.com', companyName: 'Flipkart' },
    { logo: 'https://logo.clearbit.com/paytm.com', companyName: 'Paytm' },
  ], []);

  // Testimonial reviews - memoized to prevent recreation
  const testimonials = useMemo(() => [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'Google',
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      review: 'This platform completely transformed my career! The courses are top-notch and the mentors are incredibly supportive.',
      rating: 5,
      social: { platform: 'instagram', handle: '@priya_tech' }
    },
    {
      name: 'Rajesh Kumar',
      role: 'Full Stack Developer',
      company: 'Microsoft',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      review: 'Best investment I ever made. Got placed at Microsoft within 6 months of completing the bootcamp!',
      rating: 5,
      social: { platform: 'twitter', handle: '@rajesh_dev' }
    },
    {
      name: 'Sarah Johnson',
      role: 'Data Scientist',
      company: 'Amazon',
      image: 'https://randomuser.me/api/portraits/women/3.jpg',
      review: 'The AI and ML courses are exceptional. Real-world projects and industry-standard curriculum.',
      rating: 5,
      social: { platform: 'instagram', handle: '@sarah_datascience' }
    },
    {
      name: 'Amit Patel',
      role: 'DevOps Engineer',
      company: 'TCS',
      image: 'https://randomuser.me/api/portraits/men/4.jpg',
      review: 'Excellent mentorship and placement support. Landed my dream job thanks to this platform!',
      rating: 5,
      social: { platform: 'twitter', handle: '@amit_devops' }
    },
    {
      name: 'Emily Chen',
      role: 'Frontend Developer',
      company: 'Infosys',
      image: 'https://randomuser.me/api/portraits/women/5.jpg',
      review: 'The React and JavaScript courses are incredible. Hands-on projects made all the difference.',
      rating: 5,
      social: { platform: 'instagram', handle: '@emily_frontend' }
    },
    {
      name: 'Vikram Singh',
      role: 'Backend Developer',
      company: 'Wipro',
      image: 'https://randomuser.me/api/portraits/men/6.jpg',
      review: 'From zero to hero! The structured curriculum and live sessions are game-changers.',
      rating: 5,
      social: { platform: 'twitter', handle: '@vikram_backend' }
    }
  ], []);

  useEffect(() => {
    // Fetch data once on component mount
    const fetchData = async () => {
      try {
        // Fetch bootcamps
        try {
          const bootcampsRes = await APIService.bootcamps.getAll();
          const bootcampsData = bootcampsRes?.data?.data || bootcampsRes?.data || [];
          setBootcamps(Array.isArray(bootcampsData) ? bootcampsData : []);
        } catch {
          setBootcamps([]);
        }

        // Fetch companies
        try {
          const companiesRes = await APIService.companies.getAll();
          const companiesData = companiesRes?.data?.data || companiesRes?.data || [];
          if (Array.isArray(companiesData) && companiesData.length > 0) {
            setCompanies(companiesData);
          } else {
            setCompanies(fallbackCompanies);
          }
        } catch {
          setCompanies(fallbackCompanies);
        }

        // Fetch videos
        try {
          const videosRes = await APIService.videos.getAll();
          setVideos(Array.isArray(videosRes.data) ? videosRes.data : []);
        } catch {
          setVideos([]);
        }

      } catch {
        // Silent fail
      }
    };

    fetchData();
  }, [fallbackCompanies]);

  // Auto-scroll effect with cleanup
  useEffect(() => {
    const companiesScroller = companiesScrollerRef.current;
    if (!companiesScroller || companies.length === 0) return;

    let animationFrame;
    const scrollSpeed = 1;

    const autoScroll = () => {
      if (companiesScroller.scrollLeft >= companiesScroller.scrollWidth - companiesScroller.clientWidth) {
        companiesScroller.scrollLeft = 0;
      } else {
        companiesScroller.scrollLeft += scrollSpeed;
      }
      animationFrame = requestAnimationFrame(autoScroll);
    };

    autoScroll();
    return () => cancelAnimationFrame(animationFrame);
  }, [companies]);

  const achievements = useMemo(() => [
    { title: 'Highest Package', value: '₹48.5 LPA', icon: '🏆', gradient: 'from-amber-500 to-orange-600' },
    { title: 'Average Salary', value: '₹12.8 LPA', icon: '💰', gradient: 'from-emerald-500 to-teal-600' },
    { title: 'Companies Hiring', value: '500+', icon: '🏢', gradient: 'from-blue-500 to-cyan-600' },
    { title: 'Career Mentors', value: '100+', icon: '👨‍🏫', gradient: 'from-purple-500 to-pink-600' },
  ], []);

  const stats = useMemo(() => [
    { value: '10K+', label: 'Active Learners', icon: '👥' },
    { value: '95%', label: 'Placement Rate', icon: '📈' },
    { value: '500+', label: 'Course Hours', icon: '⏱️' },
    { value: '50+', label: 'Industry Partners', icon: '🤝' },
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-0 overflow-x-hidden">
      {/* Hero Section - Clean & Elegant */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Orbiting AI Spaceships */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative w-full h-full max-w-5xl">
            {/* Spaceship 1: AI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
              <div className="absolute w-full h-full animate-orbit-fast">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group animate-spaceship-float">
                    <div className="text-5xl filter drop-shadow-2xl">🛸</div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black text-white px-3 py-1 rounded-full z-20 bg-purple-600 shadow-lg shadow-purple-500/50">
                      AI
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spaceship 2: ML */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px]">
              <div className="absolute w-full h-full animate-orbit-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group animate-spaceship-float" style={{ animationDelay: '0.5s' }}>
                    <div className="text-5xl filter drop-shadow-2xl">🛸</div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black text-white px-3 py-1 rounded-full z-20 bg-pink-600 shadow-lg shadow-pink-500/50">
                      ML
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spaceship 3: Gen AI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px]">
              <div className="absolute w-full h-full animate-orbit-medium" style={{ animationDirection: 'reverse' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group animate-spaceship-float" style={{ animationDelay: '1s' }}>
                    <div className="text-4xl filter drop-shadow-2xl">🛸</div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-white px-2 py-0.5 rounded-full z-20 whitespace-nowrap bg-blue-600 shadow-lg shadow-blue-500/50">
                      Gen AI
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spaceship 4: NLP */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px]">
              <div className="absolute w-full h-full animate-orbit-slower">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group animate-spaceship-float" style={{ animationDelay: '1.5s' }}>
                    <div className="text-4xl filter drop-shadow-2xl">🛸</div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black text-white px-3 py-1 rounded-full z-20 bg-emerald-600 shadow-lg shadow-emerald-500/50">
                      NLP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spaceship 5: CV */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px]">
              <div className="absolute w-full h-full animate-orbit-faster" style={{ animationDirection: 'reverse' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative group animate-spaceship-float" style={{ animationDelay: '0.7s' }}>
                    <div className="text-4xl filter drop-shadow-2xl">🛸</div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black text-white px-3 py-1 rounded-full z-20 bg-orange-600 shadow-lg shadow-orange-500/50">
                      CV
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Floating Code Symbols - Orange */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          {[
            { symbol: '{', top: '15%', left: '10%' },
            { symbol: '}', top: '25%', right: '15%' },
            { symbol: '</', top: '45%', left: '8%' },
            { symbol: '/>', top: '35%', right: '12%' },
            { symbol: '=>', top: '60%', left: '20%' },
            { symbol: '{ }', top: '70%', right: '25%' },
            { symbol: '[ ]', top: '20%', left: '30%' },
            { symbol: '...', top: '55%', right: '18%' },
          ].map((item, i) => (
            <div
              key={i}
              className="absolute text-orange-400/60 text-2xl font-mono animate-float-gentle"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${15 + i * 2}s`
              }}
            >
              {item.symbol}
            </div>
          ))}
        </div>

        <div className="relative z-10 px-4 max-w-6xl mx-auto text-center">
          {/* Offer Badge */}
          <div className="mb-8 animate-fadeInDown">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {props.bannerData?.offer || 'Limited Time Offer'}
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>

          {/* Main Heading with Wave Animation & Shining Effect */}
          <div className="relative mb-8 animate-fadeInUp px-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-center">
              <span className="relative inline">
                {(props.bannerData?.heading || 'Transform Your Future in AI').split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block mr-2 sm:mr-4">
                    {word.split('').map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="relative inline-block animate-wave"
                        style={{
                          animationDelay: `${(wordIndex * 5 + charIndex) * 0.05}s`
                        }}
                      >
                        <span className="relative z-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-2xl">
                          {char}
                        </span>
                        {/* Individual spreading rays for each letter */}
                        <span
                          className="absolute inset-0 letter-rays pointer-events-none"
                          style={{
                            animationDelay: `${(wordIndex * 5 + charIndex) * 0.05}s`
                          }}
                        ></span>
                      </span>
                    ))}
                  </span>
                ))}
                {/* Gentle overall glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl opacity-50 animate-pulse -z-10"></span>
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {props.bannerData?.tag || 'Master cutting-edge technologies with industry experts'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 text-lg font-bold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50 overflow-hidden transition-all duration-300 hover:shadow-purple-500/80 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center">
                Join Free Bootcamp
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <Link to="/courses">
              <button className="px-8 py-4 text-lg font-bold rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 shadow-xl">
                Explore Courses
              </button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:bg-white/10 cursor-pointer"
              >
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Bootcamps */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 w-full max-w-lg border border-white/10 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Choose Your Path
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors hover:rotate-90 transform duration-300"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-slate-400 text-sm">
                {bootcamps.length > 0 ? `Found ${bootcamps.length} bootcamp(s)` : 'Loading bootcamps...'}
              </p>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {Array.isArray(bootcamps) && bootcamps.length > 0 ? bootcamps.map((bootcamp, index) => (
                <Link
                  key={bootcamp._id || index}
                  to={`/free-class/${bootcamp._id}`}
                  onClick={() => setIsModalOpen(false)}
                  className="block group"
                >
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors block">
                          {bootcamp.courseName || bootcamp.roadMapName || 'Bootcamp'}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 block">
                          {bootcamp.days} Days | Starts: {new Date(bootcamp.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <svg className="w-6 h-6 text-purple-400 transform group-hover:translate-x-2 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center text-slate-400 py-8">
                  <p>No bootcamps available at the moment.</p>
                  <p className="text-sm mt-2">Check back soon for new courses!</p>
                  <p className="text-xs mt-4 text-slate-500">Debug: bootcamps.length = {bootcamps.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative py-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Why Choose Us
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to accelerate your tech career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">AI-Powered Learning</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Personalized learning paths powered by advanced AI that adapts to your pace and goals.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Expert Mentorship</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Learn from industry experts with years of experience at top tech companies.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Verified Certificates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Earn industry-recognized certificates that boost your resume and credibility.</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">Job Placement</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Get placed at top companies with our dedicated placement assistance program.</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">10K+</div>
              <p className="text-gray-400 mt-2 font-medium">Students Trained</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">500+</div>
              <p className="text-gray-400 mt-2 font-medium">Companies Hiring</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">95%</div>
              <p className="text-gray-400 mt-2 font-medium">Placement Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">4.9★</div>
              <p className="text-gray-400 mt-2 font-medium">Student Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative py-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
      </div>

      {/* Success Stories / Reviews Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">
                {videos.length > 0 ? 'Success Stories' : 'What Our Students Say'}
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {videos.length > 0 ? 'Real people, real transformations, real results' : 'Trusted by thousands of learners worldwide'}
            </p>
          </div>

          <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-8">
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <div
                    key={video._id}
                    className="flex-shrink-0 w-[350px] group"
                  >
                    <div className="rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                      <div className="relative h-[400px] overflow-hidden">
                        <iframe
                          src={video.videoUrl}
                          allow="autoplay"
                          className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl">
                        <h3 className="font-bold text-2xl mb-2 group-hover:text-emerald-400 transition-colors">
                          {video.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {video.jobRole} at <span className="text-white font-semibold">{video.companyName}</span>
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-black text-2xl">₹{video.package} LPA</span>
                          <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                            Placed
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[350px] group"
                  >
                    <div className="h-full rounded-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 p-6 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
                      <div className="flex items-center mb-4">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full border-2 border-emerald-500/30 mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-white mb-1">{testimonial.name}</h3>
                          <p className="text-sm text-gray-400">{testimonial.role}</p>
                          <p className="text-sm text-emerald-400 font-semibold">{testimonial.company}</p>
                        </div>
                      </div>

                      <p className="text-base text-gray-300 mb-4 leading-relaxed italic">
                        "{testimonial.review}"
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          {testimonial.social.platform === 'instagram' ? (
                            <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          )}
                          <span>{testimonial.social.handle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative py-20">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
                Our Achievements
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Numbers that speak louder than words
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="group relative p-7 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    {achievement.icon}
                  </div>
                  <div className={`text-4xl font-black mb-2 bg-gradient-to-r ${achievement.gradient} text-transparent bg-clip-text`}>
                    {achievement.value}
                  </div>
                  <div className="text-lg text-gray-400 font-semibold group-hover:text-white transition-colors">
                    {achievement.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer {...props.bannerData} />

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes letterRays {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          30% {
            opacity: 0.8;
            transform: scale(1.5);
          }
          60% {
            opacity: 0.4;
            transform: scale(2.5);
          }
          100% {
            opacity: 0;
            transform: scale(3.5);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .letter-rays {
          background: radial-gradient(
            ellipse at center,
            rgba(236, 72, 153, 0.6) 0%,
            rgba(168, 85, 247, 0.4) 30%,
            rgba(139, 92, 246, 0.2) 60%,
            transparent 100%
          );
          animation: letterRays 2s ease-out infinite;
          filter: blur(20px);
        }

        @keyframes glowGentle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spaceshipFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
            opacity: 0.5;
          }
        }

        .animate-orbit {
          animation: orbit 30s linear infinite;
        }

        .animate-orbit-faster {
          animation: orbit 15s linear infinite;
        }

        .animate-orbit-fast {
          animation: orbit 20s linear infinite;
        }

        .animate-orbit-medium {
          animation: orbit 25s linear infinite;
        }

        .animate-orbit-slow {
          animation: orbit 35s linear infinite;
        }

        .animate-orbit-slower {
          animation: orbit 40s linear infinite;
        }

        .animate-spaceship-float {
          animation: spaceshipFloat 2s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }

        /* UFO Spaceship Base Styles */
        .ufo-ship-purple,
        .ufo-ship-pink,
        .ufo-ship-blue,
        .ufo-ship-green,
        .ufo-ship-orange {
          position: relative;
          width: 60px;
          height: 30px;
        }

        .ufo-dome {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 18px;
          border-radius: 50% 50% 0 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05));
          box-shadow: 
            0 0 10px rgba(255,255,255,0.3),
            inset 0 -2px 5px rgba(0,0,0,0.2);
        }

        .ufo-base {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 12px;
          border-radius: 50%;
          box-shadow: 
            0 5px 20px rgba(0,0,0,0.4),
            inset 0 2px 5px rgba(255,255,255,0.2),
            inset 0 -2px 5px rgba(0,0,0,0.3);
        }

        .ufo-lights {
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        .ufo-lights span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 8px currentColor;
          animation: blink 1.5s infinite;
        }

        .ufo-lights span:nth-child(2) {
          animation-delay: 0.5s;
        }

        .ufo-lights span:nth-child(3) {
          animation-delay: 1s;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Color Variants */
        .ufo-ship-purple .ufo-base {
          background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6b21a8 100%);
        }

        .ufo-ship-purple .ufo-lights span {
          color: #a855f7;
        }

        .ufo-ship-pink .ufo-base {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%);
        }

        .ufo-ship-pink .ufo-lights span {
          color: #f472b6;
        }

        .ufo-ship-blue .ufo-base {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
        }

        .ufo-ship-blue .ufo-lights span {
          color: #60a5fa;
        }

        .ufo-ship-green .ufo-base {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        }

        .ufo-ship-green .ufo-lights span {
          color: #34d399;
        }

        .ufo-ship-orange .ufo-base {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
        }

        .ufo-ship-orange .ufo-lights span {
          color: #fb923c;
        }

        .shimmer-text {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .animate-glow-gentle {
          animation: glowGentle 4s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: floatGentle var(--duration, 15s) ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
};

export default Home;