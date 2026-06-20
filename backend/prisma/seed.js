const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding Indian job board mockup...');

  // Clean old data
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.employerProfile.deleteMany({});
  await prisma.jobSeekerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashes
  const seekerHash = await bcrypt.hash('seeker123', 10);
  const employerHash1 = await bcrypt.hash('recruiter123', 10);
  const employerHash2 = await bcrypt.hash('recruiter123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // 1. Create Seeker (Aarav Sharma)
  const seeker1User = await prisma.user.create({
    data: {
      email: 'aarav@gmail.com',
      passwordHash: seekerHash,
      role: 'SEEKER',
    },
  });

  const seeker1Profile = await prisma.jobSeekerProfile.create({
    data: {
      userId: seeker1User.id,
      fullName: 'Aarav Sharma',
      headline: 'Senior Full Stack Engineer | React & Node.js Specialist',
      bio: 'Enthusiastic full-stack engineer with 5+ years of experience building scalable products. Vetted expert in Next.js, TypeScript, and high-performance Express APIs.',
      location: 'Bengaluru, Karnataka',
      skills: 'React, TypeScript, Next.js, Node.js, Express, Postgres, Docker, Git, REST APIs',
      experience: JSON.stringify([
        {
          title: 'Senior Frontend Developer',
          company: 'Flipkart',
          location: 'Bengaluru, Karnataka',
          startDate: 'Jun 2023',
          endDate: 'Present',
          description: 'Optimized Flipkart mobile web search checkout flows, improving page interaction metrics by 25%. Led a group of 4 junior developers to restructure components.',
          current: true
        },
        {
          title: 'Software Engineer',
          company: 'TCS',
          location: 'Pune, Maharashtra',
          startDate: 'Jul 2021',
          endDate: 'May 2023',
          description: 'Collaborated on global banking systems. Configured secure user-auth endpoints and automated test cases, boosting coverage by 15%.',
          current: false
        }
      ]),
      education: JSON.stringify([
        {
          school: 'Indian Institute of Technology (IIT), Bombay',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science & Engineering',
          startDate: 'Aug 2017',
          endDate: 'May 2021'
        }
      ]),
      visibility: 'PUBLIC',
      openToWork: true,
      resumeUrl: '/uploads/mock_resume.pdf'
    },
  });

  // 2. Create Employers (Flipkart & TCS)
  const emp1User = await prisma.user.create({
    data: {
      email: 'recruiter@flipkart.com',
      passwordHash: employerHash1,
      role: 'EMPLOYER',
    },
  });

  const emp1Profile = await prisma.employerProfile.create({
    data: {
      userId: emp1User.id,
      companyName: 'Flipkart',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Flipkart is Indias leading e-commerce marketplace, making shopping online accessible and affordable to millions of customers across the nation.',
      industry: 'E-Commerce & Tech',
      size: '10,000+',
      location: 'Bengaluru, Karnataka',
      websiteUrl: 'https://flipkart.com',
    },
  });

  const emp2User = await prisma.user.create({
    data: {
      email: 'recruiter@tcs.com',
      passwordHash: employerHash2,
      role: 'EMPLOYER',
    },
  });

  const emp2Profile = await prisma.employerProfile.create({
    data: {
      userId: emp2User.id,
      companyName: 'Tata Consultancy Services (TCS)',
      logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Tata Consultancy Services is an IT services, consulting, and business solutions organization that has been partnering with many of the worlds largest businesses for over 50 years.',
      industry: 'IT Services & Consulting',
      size: '100,000+',
      location: 'Mumbai, Maharashtra',
      websiteUrl: 'https://tcs.com',
    },
  });

  const emp3User = await prisma.user.create({
    data: {
      email: 'recruiter@zomato.com',
      passwordHash: employerHash1,
      role: 'EMPLOYER',
    },
  });

  const emp3Profile = await prisma.employerProfile.create({
    data: {
      userId: emp3User.id,
      companyName: 'Zomato',
      logoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Zomato is an Indian multinational restaurant aggregator and food delivery company. Zomato provides menus, reviews, and food delivery options from partner restaurants.',
      industry: 'Foodtech & Logistics',
      size: '5,000+',
      location: 'Gurugram, Haryana',
      websiteUrl: 'https://zomato.com',
    },
  });

  const emp4User = await prisma.user.create({
    data: {
      email: 'recruiter@jio.com',
      passwordHash: employerHash1,
      role: 'EMPLOYER',
    },
  });

  const emp4Profile = await prisma.employerProfile.create({
    data: {
      userId: emp4User.id,
      companyName: 'Reliance Jio',
      logoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Reliance Jio Infocomm Limited is an Indian telecommunications company and subsidiary of Jio Platforms, operating a national LTE and 5G network.',
      industry: 'Telecom & Tech',
      size: '20,000+',
      location: 'Navi Mumbai, Maharashtra',
      websiteUrl: 'https://jio.com',
    },
  });

  const emp5User = await prisma.user.create({
    data: {
      email: 'recruiter@paytm.com',
      passwordHash: employerHash1,
      role: 'EMPLOYER',
    },
  });

  const emp5Profile = await prisma.employerProfile.create({
    data: {
      userId: emp5User.id,
      companyName: 'Paytm',
      logoUrl: 'https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Paytm is an Indian multinational financial technology company, specializing in digital payment systems, financial services, and e-commerce portals.',
      industry: 'Fintech',
      size: '10,000+',
      location: 'Noida, Uttar Pradesh',
      websiteUrl: 'https://paytm.com',
    },
  });

  const emp6User = await prisma.user.create({
    data: {
      email: 'recruiter@infosys.com',
      passwordHash: employerHash1,
      role: 'EMPLOYER',
    },
  });

  const emp6Profile = await prisma.employerProfile.create({
    data: {
      userId: emp6User.id,
      companyName: 'Infosys',
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&h=100&q=80',
      description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology, and outsourcing services.',
      industry: 'IT Services & Consulting',
      size: '100,000+',
      location: 'Bengaluru, Karnataka',
      websiteUrl: 'https://infosys.com',
    },
  });

  // 3. Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@wave.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  // 4. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      employerId: emp1Profile.id,
      title: 'Senior React Developer (Flipkart Grocery)',
      description: 'Flipkart is looking for a Senior React Developer to join our Grocery division in Bengaluru. You will work on scaling UI components to support 10M+ daily active buyers, enhancing web vitals and bundle load efficiency.',
      requirements: '## Requirements\n- 4+ years of React development experience in high-traffic applications\n- Excellent hands-on skills in TypeScript, CSS/HTML, and Redux Toolkit\n- Prior experience in optimizing web performance for low-bandwidth connections\n- Engineering degree from Tier 1/2 college is preferred',
      skills: 'React, TypeScript, Redux, Performance Optimization, Webpack',
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      salaryMin: 1800000, // 18 LPA
      salaryMax: 2800000, // 28 LPA
      isFeatured: true,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const job2 = await prisma.job.create({
    data: {
      employerId: emp2Profile.id,
      title: 'Systems Software Engineer (Banking Console)',
      description: 'Join the banking systems console team at TCS. You will maintain security policies, optimize database queries for banking ledgers, and build interface modules for client dashboards.',
      requirements: '## Preferred Skills\n- Experience building RESTful APIs in Express or Spring Boot\n- Strong SQL query optimization and database normalization knowledge\n- 2+ years of professional software engineering experience',
      skills: 'Node.js, Express, Postgres, SQL, Java',
      location: 'Mumbai, Maharashtra',
      workMode: 'ON_SITE',
      jobType: 'FULL_TIME',
      salaryMin: 800000,  // 8 LPA
      salaryMax: 1400000, // 14 LPA
      isFeatured: false,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    },
  });

  const job3 = await prisma.job.create({
    data: {
      employerId: emp1Profile.id,
      title: 'Node.js Backend Developer Intern',
      description: 'Flipkart offers 6-month winter/summer internship programs for engineering students. You will collaborate with senior developers on real API payment flows and scaling database schemas.',
      requirements: '## Requirements\n- Enrolled in B.Tech/M.Tech Computer Science programs\n- Basic coding knowledge in JavaScript/Node.js or Python\n- Good understanding of database design principles',
      skills: 'Node.js, Express, Postgres, Git',
      location: 'Noida, Uttar Pradesh',
      workMode: 'HYBRID',
      jobType: 'INTERNSHIP',
      salaryMin: 40000,  // 40k/month
      salaryMax: 50000,  // 50k/month
      isFeatured: false,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    },
  });

  const job4 = await prisma.job.create({
    data: {
      employerId: emp3Profile.id,
      title: 'Senior Backend Engineer (Logistics & Routing)',
      description: 'Zomato is looking for a Senior Backend Engineer to join our logistics team. You will build and scale high-throughput routing algorithms that dispatch delivery partners in real-time, optimizing order transit times across 500+ cities.',
      requirements: '## Requirements\n- 5+ years of experience in Node.js, Go, or Java\n- Strong experience in microservices architecture and Redis caching\n- Hands-on expertise with geolocation queries and spatial indexing (GIS)\n- Engineering degree from Tier 1/2 college is preferred',
      skills: 'Node.js, Go, Redis, PostgreSQL, GIS',
      location: 'Gurugram, Haryana',
      workMode: 'ON_SITE',
      jobType: 'FULL_TIME',
      salaryMin: 2200000,
      salaryMax: 3500000,
      isFeatured: true,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const job5 = await prisma.job.create({
    data: {
      employerId: emp4Profile.id,
      title: 'Cloud DevOps Engineer (JioCloud Services)',
      description: 'Jio is looking for a Cloud DevOps Engineer to scale JioCloud services infrastructure. You will manage large Kubernetes clusters, automate deployment pipelines for media streaming platforms, and optimize AWS/Azure hybrid infrastructure.',
      requirements: '## Requirements\n- 3+ years of experience managing Kubernetes clusters in production\n- Proficient in Terraform, Ansible, and Jenkins/GitHub Actions\n- Excellent understanding of Docker containers and Linux networking\n- Certified Kubernetes Administrator (CKA) is a plus',
      skills: 'Kubernetes, Docker, Terraform, AWS, Linux, CI/CD',
      location: 'Navi Mumbai, Maharashtra',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      salaryMin: 1200000,
      salaryMax: 2000000,
      isFeatured: false,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
    },
  });

  const job6 = await prisma.job.create({
    data: {
      employerId: emp5Profile.id,
      title: 'Frontend Security Engineer (Payment Gateways)',
      description: 'Paytm is looking for a Frontend Security Engineer to protect our payment checkout pages. You will implement robust CSRF/XSS defenses, secure web storage usage, and audit React bundles for data leaks.',
      requirements: '## Requirements\n- Strong experience in React.js and browser security mechanisms\n- In-depth understanding of Content Security Policies (CSP) and CORS\n- 3+ years of frontend development experience with security focus\n- Familiarity with OWASP top 10 frontend vulnerabilities',
      skills: 'React, JavaScript, Web Security, Cryptography, OAuth',
      location: 'Noida, Uttar Pradesh',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      salaryMin: 1500000,
      salaryMax: 2400000,
      isFeatured: true,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    },
  });

  const job7 = await prisma.job.create({
    data: {
      employerId: emp6Profile.id,
      title: 'Associate Java Developer (Global Finance Platform)',
      description: 'Join Infosys as an Associate Java Developer. You will support global banking clients in migrating legacy monolith platforms to Spring Boot microservices, building secure APIs, and integrating message queues.',
      requirements: '## Requirements\n- 1-3 years of experience in Java and Spring Boot framework\n- Understanding of relational databases (Oracle, MySQL)\n- Good communication skills and team collaboration ability\n- Bachelor\'s degree in Engineering or Computer Applications',
      skills: 'Java, Spring Boot, Hibernate, SQL, JUnit',
      location: 'Bengaluru, Karnataka',
      workMode: 'ON_SITE',
      jobType: 'FULL_TIME',
      salaryMin: 500000,
      salaryMax: 800000,
      isFeatured: false,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    },
  });

  // 5. Create Applications
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      seekerId: seeker1Profile.id,
      resumeUrl: seeker1Profile.resumeUrl || '',
      coverLetter: 'I am highly interested in the Flipkart Grocery UI team. Having already worked at Flipkart, I understand the scale and challenges of e-commerce web applications. I believe my 5+ years of React/Next.js experience aligns with your specifications.',
      status: 'SHORTLISTED',
      rating: 5,
      internalNotes: 'Excellent internal candidate match. Strong React skills, already familiar with Flipkart systems. Move to immediate technical rounds.',
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: job2.id,
      seekerId: seeker1Profile.id,
      resumeUrl: seeker1Profile.resumeUrl || '',
      coverLetter: 'Applying for the Systems Software Engineer role. I worked as a software engineer at TCS Pune previously and would love to re-join in Mumbai.',
      status: 'APPLIED',
    },
  });

  // 6. Create Message Threads
  await prisma.message.create({
    data: {
      senderId: emp1User.id,
      receiverId: seeker1User.id,
      content: 'Hi Aarav, thanks for applying! We noticed your profile and previous Flipkart work history. Let\'s connect this Thursday at 11 AM for a quick technical sync.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  await prisma.message.create({
    data: {
      senderId: seeker1User.id,
      receiverId: emp1User.id,
      content: 'Hi! Thank you for reaching out. Thursday at 11 AM works perfect. Looking forward to speaking with the team.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
      isRead: false,
    },
  });

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: seeker1User.id,
      type: 'APPLICATION_STATUS',
      title: 'Application Shortlisted',
      message: 'Your application for "Senior React Developer" at Flipkart has been Shortlisted!',
      link: '/seeker/dashboard',
    },
  });

  await prisma.notification.create({
    data: {
      userId: emp1User.id,
      type: 'NEW_APPLICATION',
      title: 'New Application Received',
      message: 'Aarav Sharma applied for your listing: "Senior React Developer"',
      link: '/employer/jobs/' + job1.id + '/applicants',
    },
  });

  console.log('Indian job board seed database completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
