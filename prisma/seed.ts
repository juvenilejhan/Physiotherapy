import {
  PrismaClient,
  UserRole,
  AccountType,
  AppointmentStatus,
  AppointmentType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log("👥 Creating users...");

  // Admin User
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@physioconnect.com" },
    update: {},
    create: {
      email: "admin@physioconnect.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      accountType: AccountType.CREDENTIALS,
      emailVerified: true,
      phone: "+1 (555) 100-0001",
    },
  });

  // Receptionist
  const receptionistPassword = await bcrypt.hash("receptionist123", 12);
  const receptionist = await prisma.user.upsert({
    where: { email: "reception@physioconnect.com" },
    update: {},
    create: {
      email: "reception@physioconnect.com",
      name: "Jane Smith",
      password: receptionistPassword,
      role: UserRole.RECEPTIONIST,
      accountType: AccountType.CREDENTIALS,
      emailVerified: true,
      phone: "+1 (555) 100-0002",
    },
  });

  // Clinic Manager
  const managerPassword = await bcrypt.hash("manager123", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@physioconnect.com" },
    update: {},
    create: {
      email: "manager@physioconnect.com",
      name: "Robert Brown",
      password: managerPassword,
      role: UserRole.CLINIC_MANAGER,
      accountType: AccountType.CREDENTIALS,
      emailVerified: true,
      phone: "+1 (555) 100-0003",
    },
  });

  // Specialists
  const specialistsData = [
    {
      email: "dr.emily.carter@physioconnect.com",
      name: "Dr. Emily Carter",
      role: UserRole.DOCTOR,
      specialization: "Sports Medicine",
      experience: 12,
      fee: 150,
      bio: "Board-certified physiotherapist specializing in sports injuries and rehabilitation. Former team physician for Olympic athletes.",
      qualifications: "Doctor of Physical Therapy, CSCS",
    },
    {
      email: "dr.michael.chen@physioconnect.com",
      name: "Dr. Michael Chen",
      role: UserRole.DOCTOR,
      specialization: "Neurological Rehabilitation",
      experience: 10,
      fee: 140,
      bio: "Expert in neurological rehabilitation with extensive experience treating stroke and spinal cord injury patients.",
      qualifications: "PhD in Neurological Physical Therapy, NCS",
    },
    {
      email: "dr.sarah.johnson@physioconnect.com",
      name: "Dr. Sarah Johnson",
      role: UserRole.DOCTOR,
      specialization: "Musculoskeletal Therapy",
      experience: 8,
      fee: 130,
      bio: "Specialized in manual therapy and musculoskeletal conditions. Passionate about helping patients return to active lifestyles.",
      qualifications: "Doctor of Physical Therapy, OCS",
    },
    {
      email: "dr.james.wilson@physioconnect.com",
      name: "Dr. James Wilson",
      role: UserRole.DOCTOR,
      specialization: "Pediatric Physiotherapy",
      experience: 7,
      fee: 120,
      bio: "Certified pediatric physical therapist creating fun and effective treatment plans for children of all ages.",
      qualifications: "Doctor of Physical Therapy, PCS",
    },
    {
      email: "dr.akm.rezwan@physioconnect.com",
      name: "Dr. A. K. M. Rezwan",
      role: UserRole.DOCTOR,
      specialization: "Joint Pain Rehabilitation",
      experience: 10,
      fee: 150,
      bio: "Distinguished clinician and academic with advanced expertise in musculoskeletal pain management, disability rehabilitation, and evidence-based physical therapy practice. His clinical strengths include patient assessment, manual therapy, therapeutic exercise, and functional rehabilitation techniques designed to restore movement and enhance quality of life.",
      qualifications:
        "PhD in Physical Therapy, Postdoctoral Scholar in Health Sciences",
    },
  ];

  const staffUsers: Array<{ user: any; staff: any }> = [];
  for (const spec of specialistsData) {
    const staffPassword = await bcrypt.hash("password123", 12);
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {},
      create: {
        email: spec.email,
        name: spec.name,
        password: staffPassword,
        role: spec.role,
        accountType: AccountType.CREDENTIALS,
        emailVerified: true,
        phone: "+1 (555) 100-" + Math.floor(Math.random() * 9000 + 1000),
      },
    });

    const staff = await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: spec.specialization,
        bio: spec.bio,
        experience: spec.experience,
        consultationFee: spec.fee,
        qualifications: spec.qualifications,
        licenseNumber: "PT-" + Math.floor(Math.random() * 100000),
        isAvailable: true,
        workingHours: JSON.stringify({
          monday: "9:00-17:00",
          tuesday: "9:00-17:00",
          wednesday: "9:00-17:00",
          thursday: "9:00-17:00",
          friday: "9:00-17:00",
          saturday: "9:00-13:00",
          sunday: "Closed",
        }),
      },
    });

    // Create schedules for each day (Monday to Saturday)
    const days = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
    for (const day of days) {
      await prisma.staffSchedule.upsert({
        where: {
          staffId_dayOfWeek_effectiveFrom: {
            staffId: staff.id,
            dayOfWeek: day,
            effectiveFrom: new Date("2025-01-01"),
          },
        },
        update: {},
        create: {
          staffId: staff.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: day === 6 ? "13:00" : "17:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          isAvailable: true,
          effectiveFrom: new Date("2025-01-01"),
        },
      });
    }

    staffUsers.push({ user, staff });
  }

  // Sample Patients
  const patientsData = [
    {
      email: "john.doe@example.com",
      name: "John Doe",
      phone: "+1 (555) 200-0001",
      dob: "1985-03-15",
      address: "456 Oak Street",
      city: "Springfield",
      state: "IL",
      postalCode: "62704",
      emergencyContact: "Mary Doe (Wife)",
      emergencyPhone: "+1 (555) 200-0002",
      bloodGroup: "O+",
      allergies: "Penicillin",
      medicalConditions: "Chronic lower back pain",
      medications: "Ibuprofen 400mg as needed",
    },
    {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      phone: "+1 (555) 200-0003",
      dob: "1990-07-22",
      address: "789 Pine Avenue",
      city: "Riverside",
      state: "CA",
      postalCode: "92501",
      emergencyContact: "Robert Smith (Husband)",
      emergencyPhone: "+1 (555) 200-0004",
      bloodGroup: "A+",
      allergies: "None",
      medicalConditions: "Knee injury from running",
      medications: "None",
    },
    {
      email: "mike.johnson@example.com",
      name: "Mike Johnson",
      phone: "+1 (555) 200-0005",
      dob: "1978-11-30",
      address: "321 Elm Drive",
      city: "Lakewood",
      state: "NJ",
      postalCode: "08701",
      emergencyContact: "Linda Johnson (Sister)",
      emergencyPhone: "+1 (555) 200-0006",
      bloodGroup: "B+",
      allergies: "Sulfa drugs",
      medicalConditions: "Rotator cuff injury",
      medications: "Naproxen 500mg twice daily",
    },
    {
      email: "sarah.williams@example.com",
      name: "Sarah Williams",
      phone: "+1 (555) 200-0007",
      dob: "1992-05-10",
      address: "654 Maple Lane",
      city: "Oak Park",
      state: "IL",
      postalCode: "60302",
      emergencyContact: "David Williams (Brother)",
      emergencyPhone: "+1 (555) 200-0008",
      bloodGroup: "AB+",
      allergies: "Latex",
      medicalConditions: "ACL tear - post-surgery rehabilitation",
      medications: "None",
    },
    {
      email: "david.brown@example.com",
      name: "David Brown",
      phone: "+1 (555) 200-0009",
      dob: "1982-09-18",
      address: "987 Cedar Street",
      city: "Madison",
      state: "WI",
      postalCode: "53703",
      emergencyContact: "Susan Brown (Wife)",
      emergencyPhone: "+1 (555) 200-0010",
      bloodGroup: "O-",
      allergies: "None",
      medicalConditions: "Chronic neck pain",
      medications: "Muscle relaxants as needed",
    },
  ];

  const createdPatients: Array<{ user: any; patient: any }> = [];
  for (const patientData of patientsData) {
    const patientPassword = await bcrypt.hash("patient123", 12);
    const user = await prisma.user.upsert({
      where: { email: patientData.email },
      update: {},
      create: {
        email: patientData.email,
        name: patientData.name,
        password: patientPassword,
        phone: patientData.phone,
        dateOfBirth: new Date(patientData.dob),
        role: UserRole.PATIENT,
        accountType: AccountType.CREDENTIALS,
        emailVerified: true,
      },
    });

    const patient = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        address: patientData.address,
        city: patientData.city,
        state: patientData.state,
        postalCode: patientData.postalCode,
        country: "USA",
        emergencyContact: patientData.emergencyContact,
        emergencyPhone: patientData.emergencyPhone,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies,
        medicalConditions: patientData.medicalConditions,
        medications: patientData.medications,
      },
    });

    // Add medical history
    await prisma.medicalHistory.create({
      data: {
        userId: user.id,
        title: patientData.medicalConditions,
        description: `Patient has ${patientData.medicalConditions.toLowerCase()} requiring physiotherapy treatment. Allergies: ${patientData.allergies}. Medications: ${patientData.medications}`,
      },
    });

    // Add consent form
    await prisma.consentForm.create({
      data: {
        userId: user.id,
        formName: "General Treatment Consent",
        formContent: `I consent to receive physiotherapy treatment and understand the procedures involved. I understand that I can withdraw consent at any time.`,
        signedAt: new Date("2024-01-15"),
      },
    });

    createdPatients.push({ user, patient });
  }

  // ============================================
  // 2. CREATE SERVICES
  // ============================================
  console.log("💆 Creating services...");

  const servicesData = [
    {
      name: "Orthopedic Physiotherapy",
      slug: "orthopedic-physiotherapy",
      description:
        "Specialized treatment for musculoskeletal conditions, sports injuries, and post-operative rehabilitation. Our expert therapists use evidence-based techniques to restore function and relieve pain.",
      conditions:
        "Sports Injuries, Joint Pain, Post-Surgery Recovery, Arthritis, Back Pain",
      benefits:
        "Pain relief, Improved mobility, Faster recovery, Personalized treatment plans",
      duration: 60,
      price: 120,
      category: "ORTHOPEDIC",
      image: "",
      isActive: true,
    },
    {
      name: "Neurological Physiotherapy",
      slug: "neurological-physiotherapy",
      description:
        "Comprehensive care for neurological conditions to improve mobility and quality of life. We work with patients recovering from strokes, spinal cord injuries, and other neurological conditions.",
      conditions:
        "Stroke Recovery, Parkinson's, Spinal Cord Injury, Multiple Sclerosis",
      benefits:
        "Enhanced mobility, Independence, Improved quality of life, Neuroplasticity support",
      duration: 60,
      price: 130,
      category: "NEUROLOGICAL",
      image: "",
      isActive: true,
    },
    {
      name: "Sports Injury Rehabilitation",
      slug: "sports-injury-rehabilitation",
      description:
        "Expert care for athletes at all levels, from injury prevention to return-to-sport programs. Our therapists understand the unique demands of athletic performance.",
      conditions: "ACL Tears, Tennis Elbow, Rotator Cuff, Sprains and Strains",
      benefits:
        "Safe return to sport, Injury prevention, Performance optimization, Education",
      duration: 45,
      price: 100,
      category: "SPORTS",
      image: "",
      isActive: true,
    },
    {
      name: "Pediatric Physiotherapy",
      slug: "pediatric-physiotherapy",
      description:
        "Specialized treatment for children, helping them achieve developmental milestones and optimal function. We create fun, engaging treatment plans that kids enjoy.",
      conditions:
        "Developmental Delays, Cerebral Palsy, Scoliosis, Sports injuries in children",
      benefits:
        "Age-appropriate care, Family involvement, Progress tracking, Fun environment",
      duration: 45,
      price: 90,
      category: "PEDIATRIC",
      image: "",
      isActive: true,
    },
    {
      name: "Cardiopulmonary Rehabilitation",
      slug: "cardiopulmonary-rehabilitation",
      description:
        "Comprehensive programs for heart and lung conditions to improve endurance and breathing. Our evidence-based approach helps patients regain cardiovascular fitness.",
      conditions: "Heart Disease, COPD, Asthma, Post-cardiac surgery",
      benefits:
        "Improved endurance, Better breathing, Reduced symptoms, Education",
      duration: 60,
      price: 110,
      category: "CARDIOPULMONARY",
      image: "",
      isActive: true,
    },
    {
      name: "Geriatric Physiotherapy",
      slug: "geriatric-physiotherapy",
      description:
        "Specialized care for older adults to maintain mobility, independence, and prevent falls. We focus on improving balance, strength, and overall function.",
      conditions: "Balance Issues, Arthritis, Osteoporosis, Fall prevention",
      benefits:
        "Improved balance, Increased strength, Fall prevention, Independence",
      duration: 45,
      price: 95,
      category: "GERIATRIC",
      image: "",
      isActive: true,
    },
    {
      name: "Joint Pain Rehabilitation",
      slug: "joint-pain-rehabilitation",
      description:
        "Comprehensive treatment programs to relieve joint pain, restore mobility, and improve quality of life. Our expert physiotherapists address the root causes of joint discomfort including arthritis, inflammation, overuse injuries, and post-surgical recovery using evidence-based approaches.",
      conditions:
        "Osteoarthritis, Rheumatoid Arthritis, Knee Pain, Hip Bursitis, Frozen Shoulder, Tennis Elbow, Ankle Sprains, Post Joint Replacement",
      benefits:
        "Pain reduction, Improved mobility, Strengthened muscles, Better balance, Reduced medication dependency, Prevention of joint deterioration",
      duration: 50,
      price: 105,
      category: "ORTHOPEDIC",
      image: "",
      isActive: true,
    },
  ];

  const createdServices: any[] = [];
  for (const service of servicesData) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
    createdServices.push(created);
  }

  // ============================================
  // 3. ASSIGN SERVICES TO STAFF
  // ============================================
  console.log("🔗 Assigning services to staff...");

  for (const staffData of staffUsers) {
    for (const service of createdServices) {
      await prisma.staffService.upsert({
        where: {
          staffId_serviceId: {
            staffId: staffData.staff.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          staffId: staffData.staff.id,
          serviceId: service.id,
          isActive: true,
        },
      });
    }
  }

  // ============================================
  // 4. CREATE SAMPLE APPOINTMENTS
  // ============================================
  console.log("📅 Creating sample appointments...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const appointmentsData = [
    // Upcoming appointments
    {
      patient: createdPatients[0],
      service: createdServices[0], // Orthopedic
      staff: staffUsers[0], // Dr. Emily Carter
      date: tomorrow,
      time: "10:00",
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.IN_PERSON,
      notes: "Follow-up session for back pain",
    },
    {
      patient: createdPatients[1],
      service: createdServices[2], // Sports Injury
      staff: staffUsers[0], // Dr. Emily Carter
      date: tomorrow,
      time: "11:00",
      status: AppointmentStatus.PENDING,
      type: AppointmentType.IN_PERSON,
      notes: "Initial consultation",
    },
    {
      patient: createdPatients[2],
      service: createdServices[1], // Neurological
      staff: staffUsers[1], // Dr. Michael Chen
      date: nextWeek,
      time: "14:00",
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.TELEHEALTH,
      notes: "Regular neurological session",
    },
    // Completed appointments
    {
      patient: createdPatients[0],
      service: createdServices[0],
      staff: staffUsers[0],
      date: lastWeek,
      time: "09:00",
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.IN_PERSON,
      notes: "Patient showed significant improvement",
    },
    {
      patient: createdPatients[1],
      service: createdServices[3], // Pediatric
      staff: staffUsers[3], // Dr. James Wilson
      date: lastWeek,
      time: "10:30",
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.IN_PERSON,
      notes: "Excellent progress with mobility exercises",
    },
    {
      patient: createdPatients[2],
      service: createdServices[4], // Cardiopulmonary
      staff: staffUsers[1], // Dr. Michael Chen
      date: lastWeek,
      time: "11:00",
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.IN_PERSON,
      notes: "Endurance improved by 20%",
    },
    // Cancelled appointment
    {
      patient: createdPatients[3],
      service: createdServices[5], // Geriatric
      staff: staffUsers[2], // Dr. Sarah Johnson
      date: lastWeek,
      time: "14:00",
      status: AppointmentStatus.CANCELLED,
      type: AppointmentType.IN_PERSON,
      notes: "Patient rescheduled due to personal reasons",
      cancelReason: "Patient request",
    },
  ];

  for (const apt of appointmentsData) {
    const startHour = parseInt(apt.time.split(":")[0]);
    const startMinute = parseInt(apt.time.split(":")[1]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + apt.service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

    await prisma.appointment.upsert({
      where: {
        id: `apt-${apt.patient.patient.id}-${apt.staff.staff.id}-${apt.date.toISOString()}`,
      },
      update: {},
      create: {
        id: `apt-${apt.patient.patient.id}-${apt.staff.staff.id}-${apt.date.toISOString()}`,
        userId: apt.patient.user.id,
        staffId: apt.staff.staff.id,
        serviceId: apt.service.id,
        appointmentDate: apt.date,
        startTime: apt.time,
        endTime: endTime,
        status: apt.status,
        type: apt.type,
        notes: apt.notes,
        cancelReason: apt.cancelReason,
      },
    });
  }

  // ============================================
  // 5. CREATE BLOG POSTS
  // ============================================
  console.log("📝 Creating blog posts...");

  const blogPostsData = [
    {
      title: "The Benefits of Early Physiotherapy Intervention",
      excerpt:
        "Learn why seeking physiotherapy early can lead to faster recovery and better long-term outcomes.",
      content: `# The Benefits of Early Physiotherapy Intervention

Early intervention in physiotherapy can significantly impact recovery outcomes. When patients seek treatment soon after an injury or onset of symptoms, they often experience:

1. **Faster Recovery**: Addressing issues early prevents compensatory movements that can slow healing.
2. **Better Outcomes**: Early treatment often leads to more complete recovery.
3. **Reduced Pain**: Timely intervention can prevent pain from becoming chronic.
4. **Cost Effective**: Preventing issues from worsening saves money in the long run.

Don't wait! If you're experiencing pain or limited mobility, consult a physiotherapist today.`,
      authorId: staffUsers[0].user.id,
      isPublished: true,
      publishedAt: new Date("2024-01-10"),
      featuredImage: "/images/blog-treatment.jpg",
      category: "Recovery",
    },
    {
      title: "5 Tips for Preventing Sports Injuries",
      excerpt:
        "Professional advice from our sports medicine specialists on staying injury-free.",
      content: `# 5 Tips for Preventing Sports Injuries

As sports physiotherapists, we see many injuries that could have been prevented. Here are our top tips:

1. **Warm Up Properly**: Spend 10-15 minutes warming up before exercise.
2. **Use Proper Technique**: Learn correct form for your sport.
3. **Don't Skip Rest Days**: Recovery is essential for performance.
4. **Listen to Your Body**: Pain is a warning sign - don't ignore it.
5. **Cross-Train**: Mix up your activities to prevent overuse injuries.

Prevention is always better than cure. Stay safe and enjoy your sport!`,
      authorId: staffUsers[0].user.id,
      isPublished: true,
      publishedAt: new Date("2024-01-15"),
      featuredImage: "/images/blog-sports-injuries.jpg",
      category: "Sports Injuries",
    },
    {
      title: "Understanding Your Treatment Plan",
      excerpt:
        "A guide to what to expect during your physiotherapy journey with us.",
      content: `# Understanding Your Treatment Plan

Your treatment plan is designed specifically for you based on your condition, goals, and lifestyle.

## What to Expect:
- Initial assessment and goal setting
- Regular therapy sessions
- Home exercise program
- Progress tracking
- Education and self-management strategies

We believe in empowering our patients with knowledge and tools to take control of their recovery.`,
      authorId: staffUsers[1].user.id,
      isPublished: true,
      publishedAt: new Date("2024-01-20"),
      featuredImage: "/images/blog-recovery.jpg",
      category: "Wellness",
    },
    {
      title: "Managing Back Pain: A Complete Guide",
      excerpt:
        "Expert advice on understanding, treating, and preventing chronic back pain.",
      content: `# Managing Back Pain: A Complete Guide

Back pain affects millions of people worldwide. Here's what you need to know about managing it effectively.

## Common Causes of Back Pain
- Poor posture
- Muscle strain
- Herniated discs
- Sedentary lifestyle
- Improper lifting techniques

## Self-Care Tips
1. **Stay Active**: Gentle movement helps more than bed rest
2. **Improve Your Posture**: Set up an ergonomic workspace
3. **Strengthen Your Core**: A strong core supports your spine
4. **Apply Heat or Ice**: Use for 15-20 minutes at a time
5. **Stretch Regularly**: Focus on hamstrings and hip flexors

## When to See a Physiotherapist
If your pain persists for more than a week, radiates down your legs, or is accompanied by numbness, seek professional help immediately.

Our team specializes in evidence-based treatments for back pain. Book a consultation today!`,
      authorId: staffUsers[0].user.id,
      isPublished: true,
      publishedAt: new Date("2024-01-25"),
      featuredImage: "/images/blog-wellness.jpg",
      category: "Back Pain",
    },
  ];

  // Helper function to generate URL-safe slugs
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove multiple consecutive hyphens
      .trim();
  };

  for (const blog of blogPostsData) {
    const slug = generateSlug(blog.title);
    await prisma.blogPost.upsert({
      where: {
        slug,
      },
      update: {
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt,
        featuredImage: blog.featuredImage,
        category: blog.category,
      },
      create: {
        title: blog.title,
        slug,
        excerpt: blog.excerpt,
        content: blog.content,
        authorId: blog.authorId,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt,
        featuredImage: blog.featuredImage,
        category: blog.category,
      },
    });
  }

  // ============================================
  // 6. CREATE GALLERY ITEMS
  // ============================================
  console.log("🖼️ Creating gallery items...");

  const galleryItemsData = [
    {
      title: "Modern Treatment Room",
      description: "Our state-of-the-art treatment facilities",
      url: "/images/treatment-room.jpg",
      category: "FACILITY",
      type: "image",
    },
    {
      title: "Reception Area",
      description: "Welcoming and comfortable reception area",
      url: "/images/reception.jpg",
      category: "FACILITY",
      type: "image",
    },
    {
      title: "Exercise Equipment",
      description: "Latest rehabilitation and exercise equipment",
      url: "/images/equipment.jpg",
      category: "EQUIPMENT",
      type: "image",
    },
    {
      title: "Dr. Emily Carter",
      description: "Our lead sports medicine specialist",
      url: "/images/dr-emily.jpg",
      category: "TEAM",
      type: "image",
    },
    {
      title: "Patient Success Story",
      description: "Happy patient after completing rehabilitation",
      url: "/images/success-story.jpg",
      category: "TESTIMONIALS",
      type: "image",
    },
    {
      title: "Group Therapy Session",
      description: "Our small group therapy sessions",
      url: "/images/group-therapy.jpg",
      category: "SERVICES",
      type: "image",
    },
  ];

  for (const item of galleryItemsData) {
    await prisma.galleryItem.upsert({
      where: {
        id: `gallery-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `gallery-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
        title: item.title,
        description: item.description,
        url: item.url,
        category: item.category,
        type: item.type,
      },
    });
  }

  // ============================================
  // 7. CREATE CLINIC SETTINGS
  // ============================================
  console.log("⚙️ Setting up clinic configuration...");

  await prisma.clinicSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "PhysioConnect Clinic",
      email: "info@physioconnect.com",
      phone: "+8801XXXXXXXXX",
      address: "123 Healthcare Street",
      city: "Medical District",
      state: "MD",
      postalCode: "12345",
      country: "USA",
      workingHours: JSON.stringify({
        monday: "8:00-20:00",
        tuesday: "8:00-20:00",
        wednesday: "8:00-20:00",
        thursday: "8:00-20:00",
        friday: "8:00-20:00",
        saturday: "9:00-17:00",
        sunday: "Closed",
      }),
      socialMediaLinks: JSON.stringify({
        facebook: "https://facebook.com/physioconnect",
        twitter: "https://twitter.com/physioconnect",
        instagram: "https://instagram.com/physioconnect",
        linkedin: "https://linkedin.com/company/physioconnect",
      }),
    },
  });

  // ============================================
  // 8. CREATE SAMPLE PAYMENTS
  // ============================================
  console.log("💳 Creating sample payments...");

  // Create sample payments with various statuses for different scenarios
  const paymentsData = [
    // Completed payments for completed appointments
    {
      userId: createdPatients[0].user.id,
      appointmentId: `apt-${createdPatients[0].patient.id}-${staffUsers[0].staff.id}-${lastWeek.toISOString()}`,
      amount: 120,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "credit_card",
      paidAt: lastWeek,
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
      }),
    },
    {
      userId: createdPatients[1].user.id,
      appointmentId: `apt-${createdPatients[1].patient.id}-${staffUsers[3].staff.id}-${lastWeek.toISOString()}`,
      amount: 90,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "credit_card",
      paidAt: lastWeek,
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
      }),
    },
    {
      userId: createdPatients[2].user.id,
      appointmentId: `apt-${createdPatients[2].patient.id}-${staffUsers[1].staff.id}-${lastWeek.toISOString()}`,
      amount: 110,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "debit_card",
      paidAt: lastWeek,
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
      }),
    },
    // Pending payment for upcoming appointment
    {
      userId: createdPatients[0].user.id,
      appointmentId: `apt-${createdPatients[0].patient.id}-${staffUsers[0].staff.id}-${tomorrow.toISOString()}`,
      amount: 120,
      currency: "USD",
      status: "PENDING",
      paymentMethod: null,
      paidAt: null,
      gatewayResponse: null,
    },
    {
      userId: createdPatients[1].user.id,
      appointmentId: `apt-${createdPatients[1].patient.id}-${staffUsers[0].staff.id}-${tomorrow.toISOString()}`,
      amount: 100,
      currency: "USD",
      status: "PENDING",
      paymentMethod: "paypal",
      paidAt: null,
      gatewayResponse: null,
    },
    // Failed payment attempt
    {
      userId: createdPatients[3].user.id,
      amount: 95,
      currency: "USD",
      status: "FAILED",
      paymentMethod: "credit_card",
      paidAt: null,
      gatewayResponse: JSON.stringify({
        success: false,
        error: "Insufficient funds",
        paymentGateway: "stripe",
      }),
    },
    // Refunded payment
    {
      userId: createdPatients[4].user.id,
      amount: 130,
      currency: "USD",
      status: "REFUNDED",
      paymentMethod: "credit_card",
      paidAt: new Date(lastWeek.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before lastWeek
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
        refundId: "re_123456",
      }),
    },
    // Partially refunded payment
    {
      userId: createdPatients[0].user.id,
      amount: 150,
      currency: "USD",
      status: "PARTIALLY_REFUNDED",
      paymentMethod: "credit_card",
      paidAt: new Date(lastWeek.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before lastWeek
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
        refundAmount: 50,
      }),
    },
    // Additional payments for more variety
    {
      userId: createdPatients[1].user.id,
      amount: 130,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "credit_card",
      paidAt: new Date(lastWeek.getTime() - 3 * 24 * 60 * 60 * 1000),
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
      }),
    },
    {
      userId: createdPatients[2].user.id,
      amount: 140,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "paypal",
      paidAt: new Date(lastWeek.getTime() - 4 * 24 * 60 * 60 * 1000),
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "paypal",
      }),
    },
    {
      userId: createdPatients[3].user.id,
      amount: 110,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "debit_card",
      paidAt: new Date(lastWeek.getTime() - 1 * 24 * 60 * 60 * 1000),
      gatewayResponse: JSON.stringify({
        success: true,
        paymentGateway: "stripe",
      }),
    },
    {
      userId: createdPatients[4].user.id,
      amount: 90,
      currency: "USD",
      status: "PENDING",
      paymentMethod: null,
      paidAt: null,
      gatewayResponse: null,
    },
  ];

  for (const paymentData of paymentsData) {
    // Verify appointment exists if appointmentId is provided
    if (paymentData.appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: paymentData.appointmentId },
      });

      if (!appointment) {
        console.log(
          `⚠️  Appointment ${paymentData.appointmentId} not found, skipping payment`,
        );
        continue;
      }
    }

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create payment
    await prisma.payment.create({
      data: {
        userId: paymentData.userId,
        appointmentId: paymentData.appointmentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status as any,
        paymentMethod: paymentData.paymentMethod,
        transactionId: transactionId,
        gatewayResponse: paymentData.gatewayResponse,
        paidAt: paymentData.paidAt,
      },
    });
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n" + "=".repeat(60));
  console.log("📧 LOGIN CREDENTIALS");
  console.log("=".repeat(60));

  console.log("\n🔐 ADMIN ACCOUNT:");
  console.log("   Email: admin@physioconnect.com");
  console.log("   Password: admin123");

  console.log("\n👨‍⚕️ SPECIALISTS (password: password123):");
  for (const staff of staffUsers) {
    console.log(`   - ${staff.user.name}`);
    console.log(`     Email: ${staff.user.email}`);
  }

  console.log("\n👥 PATIENTS (password: patient123):");
  for (const patient of createdPatients) {
    console.log(`   - ${patient.user.name}`);
    console.log(`     Email: ${patient.user.email}`);
  }

  console.log("\n📋 OTHER ACCOUNTS:");
  console.log("   Receptionist:");
  console.log("     Email: reception@physioconnect.com");
  console.log("     Password: receptionist123");
  console.log("\n   Clinic Manager:");
  console.log("     Email: manager@physioconnect.com");
  console.log("     Password: manager123");

  console.log("\n📊 DATABASE SUMMARY:");
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Staff Members: ${await prisma.staffProfile.count()}`);
  console.log(`   Patients: ${await prisma.patientProfile.count()}`);
  console.log(`   Services: ${await prisma.service.count()}`);
  console.log(`   Appointments: ${await prisma.appointment.count()}`);
  console.log(`   Blog Posts: ${await prisma.blogPost.count()}`);
  console.log(`   Gallery Items: ${await prisma.galleryItem.count()}`);
  console.log(`   Payments: ${await prisma.payment.count()}`);
  console.log("\n" + "=".repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
