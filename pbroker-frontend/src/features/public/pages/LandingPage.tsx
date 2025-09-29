import { ArrowRight, CheckCircle, TrendingUp, Wallet, BarChart, ClipboardCheck } from "lucide-react";
import React, {  useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import type { Engine } from "tsparticles-engine";
// import { loadSlim } from "tsparticles-slim";
import { motion, useInView, type Variants, animate } from "framer-motion";
import TawkWidget from '../../tawk/presentation/TawkWidget';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const MotionSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <motion.section
    id={id}
    className={className}
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
  >
    {children}
  </motion.section>
);

// const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
//   <div className="flex flex-col items-center p-6 text-center">
//     <div className="mb-4 text-primary">{icon}</div>
//     <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
//     <p className="text-gray-400">{description}</p>
//   </div>
// );

const Step: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <motion.div variants={staggerItem} className="relative flex items-start space-x-6 pl-14">
      <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-slate-400">{description}</p>
      </div>
    </motion.div>
  );

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="relative text-white transition-colors hover:text-teal-400 group py-2">
        {children}
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-out" />
    </a>
);

const PricingCard: React.FC<{ title: string; price: string; features: string[]; popular?: boolean }> = ({ title, price, features, popular }) => (
    <Card className={`relative flex flex-col rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm transition-all duration-300 group ${popular ? 'border-teal-400 shadow-2xl shadow-teal-400/20' : 'hover:border-teal-400/50 hover:shadow-2xl hover:shadow-teal-400/10'}`}>
      {popular && (
        <div className="absolute -top-3 right-5 rounded-full bg-teal-400 px-4 py-1 text-sm font-semibold text-slate-900">Most Popular</div>
      )}
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
        <p className="text-4xl font-extrabold text-white">
          {price} <span className="text-base font-normal text-slate-400">/ one-time</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-6">
        <ul className="space-y-4 text-slate-300">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-teal-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-8 w-full bg-teal-400 text-slate-900 font-bold shadow-lg shadow-teal-400/20 hover:bg-teal-300 transition-all duration-300 transform group-hover:scale-105">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
);

const AnimatedStat: React.FC<{ to: number; from?: number; suffix: string; duration?: number }> = ({ to, from = 0, suffix, duration = 2 }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const node = ref.current;
            const controls = animate(from, to, {
                duration,
                onUpdate(value) {
                    node.textContent = value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + suffix;
                }
            });
            return () => controls.stop();
        }
    }, [isInView, from, to, duration, suffix]);

    return <span ref={ref} />;
};

const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
        staggerChildren: 0.2
        },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
};

const LandingPage: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        
        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // const particlesInit = useCallback(async (engine: Engine) => {
    //     await loadSlim(engine);
    // }, []);

    // const particlesLoaded = useCallback(async () => {
    //     // You can do something here
    // }, []);

    return (
        <div className="min-h-screen bg-slate-900 bg-gradient-to-b from-[#0A192F] to-slate-900 text-white" style={{ scrollBehavior: 'smooth' }}>
            {/* <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    background: {
                        color: { value: 'transparent' },
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: 'grab',
                            },
                        },
                        modes: {
                            grab: {
                                distance: 150,
                                links: {
                                    opacity: 0.5,
                                },
                            },
                        },
                    },
                    particles: {
                        color: { value: '#164e63' },
                        links: {
                            color: '#164e63',
                            distance: 150,
                            enable: true,
                            opacity: 0.2,
                            width: 1,
                        },
                        move: {
                            direction: 'none',
                            enable: true,
                            outModes: { default: 'bounce' },
                            random: true,
                            speed: 0.5,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 1200,
                            },
                            value: 40,
                        },
                        opacity: { value: 0.3 },
                        shape: { type: 'circle' },
                        size: { value: { min: 1, max: 3 } },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 -z-10"
            /> */}
            {/* Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm' : 'border-b border-transparent'}`}>
                <div className="container mx-auto flex h-14 md:h-20 items-center justify-between px-3 md:px-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
                           <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-teal-400" />
                           <span className="text-lg md:text-xl font-bold text-white">PBroker</span>
                        </Link>
                    </motion.div>
                    <motion.nav 
                        className="hidden md:flex items-center space-x-4 md:space-x-8 text-sm md:text-base font-medium"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <NavLink href="#features">Features</NavLink>
                        <NavLink href="#process">Process</NavLink>
                        <NavLink href="#pricing">Pricing</NavLink>
                        <NavLink href="#about">About</NavLink>
                    </motion.nav>
                    <motion.div 
                        className="flex items-center space-x-1 md:space-x-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/login">
                            <Button variant="ghost" className="text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-base hover:bg-slate-800 transition-colors">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="rounded-full bg-teal-400 text-slate-900 font-bold px-4 py-1.5 md:px-8 md:py-2 text-xs md:text-lg hover:bg-teal-300 shadow-lg shadow-teal-400/30 hover:scale-105 transition-all duration-300">
                                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container relative mx-auto px-3 md:px-6 py-16 md:py-32 sm:py-24 text-center">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-[80vw] max-w-full rounded-full bg-teal-500/10 blur-2xl filter md:h-96 md:w-[50vw]" />
                
                <motion.h1 
                    className="relative text-3xl md:text-5xl font-extrabold tracking-tight text-white sm:text-4xl md:sm:text-6xl md:md:text-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Empowering Traders <br />
                    <span className="text-teal-400">Worldwide</span>
                </motion.h1>

                <motion.p 
                    className="relative mx-auto mt-4 md:mt-6 max-w-md md:max-w-2xl text-sm md:text-lg text-slate-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Maximize your trading success with our global funding. Trade with high capital and keep up to 95% of the profits, no matter where you are in the world.
                </motion.p>
                
                <motion.div 
                    className="relative mt-6 md:mt-10 flex flex-col md:flex-row flex-wrap justify-center gap-3 md:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <Button size="lg" className="rounded-full bg-teal-400 text-slate-900 font-bold px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg hover:bg-teal-300 shadow-lg shadow-teal-400/30 hover:scale-105 transition-all duration-300">Start Evaluation</Button>
                    <Button size="lg" variant="outline" className="rounded-full border-slate-700 bg-transparent px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg text-white hover:bg-slate-800 hover:text-white transition-colors">
                        Join our Community
                    </Button>
                </motion.div>
            </main>
            
            {/* Featured On Section */}
            <MotionSection className="py-12 md:py-24 sm:py-16">
                <div className="container mx-auto px-3 md:px-6">
                    <p className="text-center text-xs md:text-sm font-semibold text-slate-500 tracking-widest uppercase">As Seen On</p>
                    <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-x-8 md:gap-x-16 gap-y-4 md:gap-y-6 text-slate-500">
                        <span className="text-lg md:text-2xl font-semibold">Bloomberg</span>
                        <span className="text-lg md:text-2xl font-semibold">Reuters</span>
                        <span className="text-lg md:text-2xl font-semibold">Forbes</span>
                        <span className="text-lg md:text-2xl font-semibold">CNBC</span>
                        <span className="text-lg md:text-2xl font-semibold">Investing.com</span>
                    </div>
                </div>
            </MotionSection>
            
            {/* Process Section */}
            <MotionSection id="process" className="py-12 md:py-24 sm:py-16">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="grid items-start gap-10 md:gap-16 lg:grid-cols-2 lg:gap-24">
                        <div className="text-center lg:text-left">
                            <p className="font-semibold uppercase text-teal-400 text-xs md:text-base">Our Process</p>
                            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white sm:text-3xl md:sm:text-4xl">Pass the Evaluation <br /> Get Funded</h2>
                            <p className="mt-4 text-sm md:text-lg text-slate-400">Start earning with our capital after passing a straightforward evaluation. Our process is designed for your success in the global market.</p>
                            <Button size="lg" className="mt-6 md:mt-8 rounded-full bg-teal-400 text-slate-900 font-bold px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg hover:bg-teal-300 shadow-lg shadow-teal-400/30 hover:scale-105 transition-all duration-300">
                                Start Evaluation
                            </Button>
                        </div>
                        <div className="relative mt-8 md:mt-0">
                            <div className="absolute left-3 top-3 h-full w-px bg-slate-700 hidden sm:block" />
                            <motion.div 
                                className="space-y-8 md:space-y-12"
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <Step 
                                    icon={<ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 text-teal-400" />} 
                                    title="1-Step Evaluation" 
                                    description="Our streamlined evaluation is designed for traders worldwide, making it accessible and straightforward." 
                                />
                                <Step 
                                    icon={<Wallet className="h-5 w-5 md:h-6 md:w-6 text-teal-400" />} 
                                    title="Get Funded & Start Earning" 
                                    description="Succeed and trade with our capital, keeping up to 95% of the profits you generate." 
                                />
                                <Step 
                                    icon={<BarChart className="h-5 w-5 md:h-6 md:w-6 text-teal-400" />} 
                                    title="Earn and Grow" 
                                    description="Scale your trading with our support. We reward consistent and profitable traders globally." 
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </MotionSection>

             {/* Stats Section */}
            <MotionSection id="stats" className="py-12 md:py-24 sm:py-16">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="text-center max-w-xl md:max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white sm:text-3xl md:sm:text-4xl">Our Global Success Story</h2>
                        <p className="mt-3 md:mt-4 text-sm md:text-lg text-slate-400">
                            We are committed to empowering traders worldwide. See our impact.
                        </p>
                    </div>
                    <motion.div 
                        className="mt-10 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                     >
                         <motion.div className="flex flex-col" variants={staggerContainer}>
                             <dd className="text-3xl md:text-5xl font-extrabold text-slate-300"><AnimatedStat to={50} suffix="+" /></dd>
                             <dt className="mt-1 md:mt-2 text-xs md:text-base font-medium text-slate-400">Countries Covered</dt>
                         </motion.div>
                         <motion.div className="flex flex-col" variants={staggerContainer}>
                             <dd className="text-3xl md:text-5xl font-extrabold text-slate-300"><AnimatedStat to={100} suffix="M+ USD" /></dd>
                             <dt className="mt-1 md:mt-2 text-xs md:text-base font-medium text-slate-400">Total Payouts</dt>
                         </motion.div>
                         <motion.div className="flex flex-col" variants={staggerContainer}>
                             <dd className="text-3xl md:text-5xl font-extrabold text-slate-300"><AnimatedStat to={6} suffix=" hrs" /></dd>
                             <dt className="mt-1 md:mt-2 text-xs md:text-base font-medium text-slate-400">Avg Payout Time</dt>
                         </motion.div>
                         <motion.div className="flex flex-col" variants={staggerContainer}>
                             <dd className="text-3xl md:text-5xl font-extrabold text-slate-300"><AnimatedStat to={2000} suffix="+" /></dd>
                             <dt className="mt-1 md:mt-2 text-xs md:text-base font-medium text-slate-400">Funded Traders</dt>
                         </motion.div>
                     </motion.div>
                </div>
            </MotionSection>

            {/* Pricing Section */}
            <MotionSection id="pricing" className="py-12 md:py-24 sm:py-16">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="text-center max-w-xl md:max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white sm:text-3xl md:sm:text-4xl">Succeed In The Evaluation <span className="text-teal-400">Scale with us</span></h2>
                        <p className="mt-3 md:mt-4 text-sm md:text-lg text-slate-400">
                            Explore our evaluation programs and kickstart your journey. Select the perfect plan to begin today!
                        </p>
                    </div>
                    <motion.div 
                        className="mt-10 md:mt-20 grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 max-w-2xl md:max-w-5xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                     >
                        <PricingCard
                            title="Starter"
                            price="$500"
                            features={[
                                "Up to $10,000 Account",
                                "85% Profit Share",
                                "24/7 Support",
                                "Global Payout Methods",
                            ]}
                        />
                        <PricingCard
                            title="Advanced"
                            price="$1,000"
                            popular
                            features={[
                                "Up to $50,000 Account",
                                "90% Profit Share",
                                "Weekly Market Analysis",
                                "Exclusive Community Group",
                            ]}
                        />
                        <PricingCard
                            title="Professional"
                            price="$2,000"
                            features={[
                                "Up to $200,000 Account",
                                "95% Profit Share",
                                "1-on-1 Coaching Session",
                                "Priority Payouts",
                            ]}
                        />
                    </motion.div>
                </div>
            </MotionSection>

            {/* Footer */}
            <MotionSection>
                <footer className="border-t border-slate-800 bg-slate-900/50">
                    <div className="container mx-auto px-3 md:px-4 py-8 md:py-12">
                        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-4">
                            <div>
                                <div className="flex items-center space-x-2 md:space-x-2">
                                    <TrendingUp className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                                    <span className="text-lg md:text-xl font-bold">PBroker</span>
                                </div>
                                <p className="mt-3 md:mt-4 text-xs md:text-base text-gray-400">The world's most trusted prop firm.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm md:text-base">Quick Links</h3>
                                <ul className="mt-3 md:mt-4 space-y-1 md:space-y-2">
                                    <li><a href="#" className="text-white hover:text-primary text-xs md:text-base">Home</a></li>
                                    <li><a href="#" className="text-white hover:text-primary text-xs md:text-base">About Us</a></li>
                                    <li><a href="#" className="text-white hover:text-primary text-xs md:text-base">FAQ</a></li>
                                    <li><a href="#" className="text-white hover:text-primary text-xs md:text-base">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm md:text-base">Legal</h3>
                                <ul className="mt-3 md:mt-4 space-y-1 md:space-y-2">
                                    <li><a href="#" className="text-white hover:text-teal-400 text-xs md:text-base">Terms of Service</a></li>
                                    <li><a href="#" className="text-white hover:text-teal-400 text-xs md:text-base">Privacy Policy</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm md:text-base">Get in Touch</h3>
                                <p className="mt-3 md:mt-4 text-xs md:text-base text-slate-400">
                                    Have questions? We're here to help. Contact our global support team.
                                </p>
                                 <a href="mailto:support@pbroker.com" className="mt-3 md:mt-4 inline-block font-semibold text-teal-400 hover:text-teal-300 transition-colors text-xs md:text-base">
                                    support@pbroker.com
                                </a>
                            </div>
                        </div>
                        <div className="mt-8 md:mt-12 border-t border-slate-800 pt-6 md:pt-8 text-center text-slate-500 text-xs md:text-base">
                            <p>&copy; {new Date().getFullYear()} PBroker. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </MotionSection>
            {/* Add TawkWidget for live chat */}
            <TawkWidget 
              propertyId="68512c5953810b190ffa393c" 
              widgetId="1ituhagam" 
            />
        </div>
    );
};

export default LandingPage; 