import React, { useState, useEffect } from 'react';
import { 
  Target, Users, TrendingUp, Shield, Award, BarChart3, 
  CheckCircle, Menu, X, ChevronRight, Clock, FileText,
  Building2, Eye, ArrowRight, Activity
} from 'lucide-react';
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Add Google Fonts link
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const objectives = [
    { icon: Target, title: "Define Role-Specific KPIs", desc: "Tailored performance indicators for every position" },
    { icon: BarChart3, title: "Develop Weighted Scoring Model", desc: "Scientific evaluation framework with balanced metrics" },
    { icon: Activity, title: "Enable Real-Time Monitoring", desc: "Live tracking of productivity and performance metrics" },
    { icon: Shield, title: "Strengthen Accountability", desc: "Transparent systems ensuring responsible governance" },
    { icon: Users, title: "Improve Employee Engagement", desc: "Foster motivation through clear performance visibility" },
    { icon: Award, title: "Enable Data-Driven Appraisals", desc: "Evidence-based evaluations for fair assessments" }
  ];

  const impacts = [
    {
      icon: Users,
      title: "Individual Level",
      desc: "Personal dashboards with KPI tracking, self-assessment tools, and performance insights for every employee."
    },
    {
      icon: Building2,
      title: "Team Level",
      desc: "Department-wide analytics, comparative performance metrics, and collaborative productivity tracking."
    },
    {
      icon: TrendingUp,
      title: "Organizational Level",
      desc: "Executive dashboards with organization-wide insights, trend analysis, and strategic decision support."
    }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Brahmaputra Board</h1>
                <p className="text-xs text-gray-500">e-Office Module</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-[#1F2937] hover:text-[#004A9F] transition">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-[#1F2937] hover:text-[#004A9F] transition">Features</button>
              <button onClick={() => scrollToSection('vision')} className="text-[#1F2937] hover:text-[#004A9F] transition">Vision</button>
              <button onClick={() => scrollToSection('objectives')} className="text-[#1F2937] hover:text-[#004A9F] transition">Objectives</button>
              <button onClick={() => scrollToSection('impact')} className="text-[#1F2937] hover:text-[#004A9F] transition">Impact</button>
             <Link to="/login">
  <button className="bg-[#004A9F] text-white px-6 py-2 rounded-lg hover:bg-[#003d82] transition shadow-md">
    Login
  </button>
</Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t py-4 space-y-3">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-2 hover:bg-[#F5F7FA] text-[#1F2937]">Home</button>
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 hover:bg-[#F5F7FA] text-[#1F2937]">Features</button>
              <button onClick={() => scrollToSection('vision')} className="block w-full text-left px-4 py-2 hover:bg-[#F5F7FA] text-[#1F2937]">Vision</button>
              <button onClick={() => scrollToSection('objectives')} className="block w-full text-left px-4 py-2 hover:bg-[#F5F7FA] text-[#1F2937]">Objectives</button>
              <button onClick={() => scrollToSection('impact')} className="block w-full text-left px-4 py-2 hover:bg-[#F5F7FA] text-[#1F2937]">Impact</button>
              <Link to="/login">
  <button className="bg-[#004A9F] text-white px-6 py-2 rounded-lg hover:bg-[#003d82] transition shadow-md">
    Login
  </button>
</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-[#FACC15] text-[#1F2937] rounded-full text-sm font-semibold">
                Government of India Initiative
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] leading-tight">
                Empowering Productivity and Transparency in Government Offices
              </h1>
              <p className="text-lg text-[#1F2937] opacity-80">
                A data-driven performance management system for HQ and field staff under the e-Office platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
      <Link
      to="/login"
      className="bg-[#004A9F] text-white px-8 py-3 rounded-lg hover:bg-[#003d82] transition flex items-center justify-center group shadow-lg"
    >
      Get Started
      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
    </Link>
                <button onClick={() => scrollToSection('vision')} className="border-2 border-[#004A9F] text-[#004A9F] px-8 py-3 rounded-lg hover:bg-[#F5F7FA] transition">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl border-4 border-orange-500 overflow-hidden">
                <div className="bg-gradient-to-r from-[#004A9F] to-blue-900 px-6 py-4 flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/150px-Emblem_of_India.svg.png" 
                      alt="Emblem of India" 
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-xl">Government of India</h3>
                    <p className="text-sm text-blue-200">Digital India Initiative</p>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-[#1F2937] mb-2">e-Governance Platform</h4>
                    <div className="w-20 h-1 bg-[#FACC15] mx-auto mb-4"></div>
                    <p className="text-[#1F2937] opacity-80">Ministry of Personnel, Public Grievances and Pensions</p>
                  </div>

                  <div className="bg-gradient-to-br from-[#F5F7FA] to-blue-50 rounded-lg p-4 mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=300&fit=crop" 
                      alt="Digital Governance" 
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Shield, label: "Secure", color: "text-[#00A3C4]" },
                      { icon: CheckCircle, label: "Transparent", color: "text-[#004A9F]" },
                      { icon: Users, label: "Accessible", color: "text-[#FACC15]" },
                      { icon: TrendingUp, label: "Efficient", color: "text-[#00A3C4]" }
                    ].map((item, i) => (
                      <div key={i} className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#004A9F] transition">
                        <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                        <p className="text-sm font-semibold text-[#1F2937]">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-[#FACC15] from-10% via-white via-50% to-[#00A3C4] to-90% p-4 rounded-lg border-l-4 border-[#004A9F]">
                    <p className="text-sm text-[#1F2937] text-center italic font-medium">
                      "Transforming India through Technology and Innovation"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop" 
                alt="Team Collaboration" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-block p-3 bg-[#FACC15] bg-opacity-20 rounded-full">
                <Eye className="w-8 h-8 text-[#004A9F]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">Our Vision</h2>
              <p className="text-lg text-[#1F2937] opacity-80 leading-relaxed">
                To establish a transparent, scientific, and data-driven productivity measurement system for government organizations, fostering accountability, efficiency, and employee engagement across all levels of administration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Key Objectives</h2>
            <p className="text-lg text-[#1F2937] opacity-80">Comprehensive framework for excellence in governance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((obj, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group border-t-4 border-[#004A9F]">
                <div className="w-12 h-12 bg-[#F5F7FA] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#004A9F] transition">
                  <obj.icon className="w-6 h-6 text-[#004A9F] group-hover:text-white transition" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">{obj.title}</h3>
                <p className="text-[#1F2937] opacity-70">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Dashboard Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">Real-Time Dashboard Analytics</h2>
              <p className="text-lg text-[#1F2937] opacity-80">
                Track organizational, team, and individual productivity in real time with comprehensive visual analytics and actionable insights.
              </p>
              <ul className="space-y-3">
                {[
                  "Live performance metrics and KPI tracking",
                  "Customizable reports and data visualization",
                  "Role-based access and security controls",
                  "Mobile-responsive interface for field staff"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#00A3C4] flex-shrink-0 mt-0.5" />
                    <span className="text-[#1F2937] opacity-80">{feature}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setIsModalOpen(true)} className="bg-[#00A3C4] text-white px-6 py-3 rounded-lg hover:bg-[#008ba8] transition flex items-center shadow-lg">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 shadow-xl">
              <div className="bg-white rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" 
                  alt="Analytics Dashboard" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-semibold text-[#1F2937]">Department Analytics</h4>
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    {[
                      { dept: "Administration", score: 94, trend: "up" },
                      { dept: "Finance", score: 88, trend: "up" },
                      { dept: "Operations", score: 91, trend: "up" },
                      { dept: "HR", score: 86, trend: "down" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <span className="text-sm text-[#1F2937] opacity-80">{item.dept}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#1F2937]">{item.score}%</span>
                          <TrendingUp className={`w-4 h-4 ${item.trend === 'up' ? 'text-[#00A3C4]' : 'text-red-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">Multi-Level Impact</h2>
            <p className="text-lg text-[#1F2937] opacity-80">Transforming governance at every organizational level</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {impacts.map((impact, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg border-t-4 border-[#FACC15] hover:shadow-xl transition">
                <img 
                  src={i === 0 ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=300&fit=crop" : 
                       i === 1 ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop" :
                       "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&h=300&fit=crop"} 
                  alt={impact.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-6">
                  <div className="w-16 h-16 bg-[#004A9F] rounded-full flex items-center justify-center mb-4 -mt-12 border-4 border-white shadow-lg">
                    <impact.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-3">{impact.title}</h3>
                  <p className="text-[#1F2937] opacity-80">{impact.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">e-Office Module</h3>
              <p className="text-sm">Empowering transparent and efficient governance through technology.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#FACC15] transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#FACC15] transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#FACC15] transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Address</h4>
              <p className="text-sm">
                Brahmaputra Board<br />
                Ministry of Jal Shakti<br />
                Government of India
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2025 Brahmaputra Board / e-Office Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#1F2937]">About e-Office Module</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F7FA] rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-[#1F2937] opacity-80">
                The e-Office Productivity Management Module is designed to digitize and streamline government operations, ensuring transparency, accountability, and efficiency across all departments.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" 
                alt="Digital Office" 
                className="w-full rounded-lg"
              />
              <p className="text-[#1F2937] opacity-80">
                This initiative aligns with the Government of India's Digital India vision, enabling real-time monitoring, data-driven decision making, and improved service delivery to citizens.
              </p>
              <button onClick={() => setIsModalOpen(false)} className="w-full bg-[#004A9F] text-white py-3 rounded-lg hover:bg-[#003d82] transition shadow-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;