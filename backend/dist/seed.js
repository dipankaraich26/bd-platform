"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding BD Platform...');
    // ─── USERS ─────────────────────────────────────────────────────────────────
    const adminHash = await bcryptjs_1.default.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@bd.local' },
        update: {},
        create: { name: 'Admin User', email: 'admin@bd.local', passwordHash: adminHash, role: 'ADMIN' },
    });
    const manager = await prisma.user.upsert({
        where: { email: 'manager@bd.local' },
        update: {},
        create: { name: 'BD Manager', email: 'manager@bd.local', passwordHash: adminHash, role: 'MANAGER' },
    });
    console.log('Users created');
    // ─── DEFENCE BUSINESSES ────────────────────────────────────────────────────
    const defenceBiz = await prisma.business.create({
        data: {
            name: 'Defence Electronics Division',
            description: 'Strategic entry into defence electronics market focusing on radar, EW, and drone systems',
            sector: 'DEFENCE',
            category: 'GENERAL',
            productNature: 'ELECTRONIC',
            stage: 'ACTIVE',
            score: 82,
            priority: 'HIGH',
            targetCustomer: 'Ministry of Defence, DRDO',
            targetMarket: 'India Defence Sector',
            estimatedValue: 5000000,
            currency: 'INR',
            startDate: new Date('2024-01-01'),
            targetDate: new Date('2026-12-31'),
            ownerId: admin.id,
            tags: ['defence', 'electronics', 'strategic'],
        },
    });
    // Sub-business: Radar
    const radarBiz = await prisma.business.create({
        data: {
            name: 'Radar Solutions',
            description: 'Ground-based and airborne radar systems for surveillance and targeting',
            sector: 'DEFENCE',
            category: 'RADAR',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'PROPOSAL',
            score: 75,
            priority: 'HIGH',
            targetCustomer: 'Indian Army, Air Force',
            estimatedValue: 2000000,
            currency: 'INR',
            parentId: defenceBiz.id,
            ownerId: manager.id,
            tags: ['radar', 'surveillance'],
        },
    });
    // Sub-business: Drone
    const droneBiz = await prisma.business.create({
        data: {
            name: 'Unmanned Aerial Systems',
            description: 'Military-grade drones for ISR and tactical operations',
            sector: 'DEFENCE',
            category: 'DRONE',
            productNature: 'HYBRID',
            stage: 'EXPLORING',
            score: 68,
            priority: 'HIGH',
            targetCustomer: 'Indian Army, DRDO',
            estimatedValue: 1500000,
            currency: 'INR',
            parentId: defenceBiz.id,
            ownerId: manager.id,
            tags: ['drone', 'UAV', 'ISR'],
        },
    });
    // Sub-business: EW
    await prisma.business.create({
        data: {
            name: 'Electronic Warfare Systems',
            description: 'Jamming, countermeasures and EW suite development',
            sector: 'DEFENCE',
            category: 'EW_SYSTEMS',
            productNature: 'ELECTRONIC',
            stage: 'IDEA',
            score: 55,
            priority: 'MEDIUM',
            estimatedValue: 800000,
            currency: 'INR',
            parentId: defenceBiz.id,
            ownerId: admin.id,
            tags: ['EW', 'jamming'],
        },
    });
    // Projects under Radar
    const radarProject = await prisma.project.create({
        data: {
            name: 'Short-Range Surveillance Radar Mk1',
            description: 'X-band ground surveillance radar for border security',
            businessId: radarBiz.id,
            type: 'PRODUCT',
            productNature: 'ELECTRO_MECHANICAL',
            status: 'DEVELOPMENT',
            score: 78,
            progress: 45,
            startDate: new Date('2024-06-01'),
            endDate: new Date('2025-12-31'),
            budget: 800000,
            customer: 'Indian Army',
            customerContact: 'Brig. Sharma',
        },
    });
    await prisma.project.create({
        data: {
            name: 'Radar Signal Processing Module',
            description: 'FPGA-based digital signal processing for radar returns',
            businessId: radarBiz.id,
            type: 'PROJECT',
            productNature: 'ELECTRONIC',
            status: 'TESTING',
            score: 85,
            progress: 80,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-06-30'),
            budget: 350000,
            customer: 'DRDO',
        },
    });
    // Projects under Drone
    await prisma.project.create({
        data: {
            name: 'Tactical VTOL Drone - Prototype',
            description: 'Vertical take-off ISR drone for tactical reconnaissance',
            businessId: droneBiz.id,
            type: 'POC',
            productNature: 'HYBRID',
            status: 'CONCEPT',
            score: 65,
            progress: 15,
            budget: 250000,
            customer: 'Indian Army',
        },
    });
    // ─── MEDICAL BUSINESSES ────────────────────────────────────────────────────
    const medicalBiz = await prisma.business.create({
        data: {
            name: 'Medical Devices Division',
            description: 'Entry into medical device market covering respiratory, anaesthesia, and patient monitoring',
            sector: 'MEDICAL',
            category: 'GENERAL',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'ACTIVE',
            score: 78,
            priority: 'HIGH',
            targetCustomer: 'Hospitals, Clinics, Government Health Programs',
            targetMarket: 'India & SE Asia',
            estimatedValue: 3500000,
            currency: 'INR',
            startDate: new Date('2024-03-01'),
            targetDate: new Date('2027-03-31'),
            ownerId: manager.id,
            tags: ['medical', 'devices', 'healthcare'],
        },
    });
    // Sub: Respiratory
    const respBiz = await prisma.business.create({
        data: {
            name: 'Respiratory Solutions',
            description: 'Ventilators, CPAP/BiPAP and oxygen therapy devices',
            sector: 'MEDICAL',
            category: 'RESPIRATORY',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'PROPOSAL',
            score: 80,
            priority: 'HIGH',
            targetCustomer: 'ICUs, Emergency Departments',
            estimatedValue: 1200000,
            parentId: medicalBiz.id,
            ownerId: manager.id,
            tags: ['ventilator', 'respiratory', 'ICU'],
        },
    });
    // Sub: Anaesthesia
    const anaesthesiaBiz = await prisma.business.create({
        data: {
            name: 'Anaesthesia Workstations',
            description: 'Integrated anaesthesia delivery and monitoring systems',
            sector: 'MEDICAL',
            category: 'ANAESTHESIA',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'EXPLORING',
            score: 70,
            priority: 'MEDIUM',
            targetCustomer: 'Operation Theatres, Private Hospitals',
            estimatedValue: 900000,
            parentId: medicalBiz.id,
            ownerId: admin.id,
            tags: ['anaesthesia', 'OT'],
        },
    });
    // Projects under Respiratory
    await prisma.project.create({
        data: {
            name: 'ICU Ventilator - Model V200',
            description: 'High-acuity ICU ventilator with advanced modes',
            businessId: respBiz.id,
            type: 'PRODUCT',
            productNature: 'ELECTRO_MECHANICAL',
            status: 'DEVELOPMENT',
            score: 82,
            progress: 60,
            startDate: new Date('2024-04-01'),
            endDate: new Date('2025-09-30'),
            budget: 500000,
            customer: 'Apollo Hospitals',
            customerContact: 'Dr. Ramesh',
        },
    });
    await prisma.project.create({
        data: {
            name: 'Portable CPAP Device',
            description: 'Home-use CPAP for sleep apnea treatment',
            businessId: respBiz.id,
            type: 'PRODUCT',
            productNature: 'ELECTRONIC',
            status: 'TESTING',
            score: 75,
            progress: 85,
            budget: 150000,
            customer: 'Healthcare Distributors Ltd',
        },
    });
    // Projects under Anaesthesia
    await prisma.project.create({
        data: {
            name: 'Anaesthesia Workstation AW-300',
            description: 'Modular anaesthesia machine with integrated monitoring',
            businessId: anaesthesiaBiz.id,
            type: 'PRODUCT',
            productNature: 'ELECTRO_MECHANICAL',
            status: 'PROPOSAL',
            score: 68,
            progress: 25,
            budget: 650000,
            customer: 'Fortis Healthcare',
        },
    });
    // ─── AUTOMOTIVE BUSINESSES ─────────────────────────────────────────────────
    const autoBiz = await prisma.business.create({
        data: {
            name: 'Automotive Solutions Division',
            description: 'Powertrain, ADAS and EV systems for passenger and commercial vehicles',
            sector: 'AUTOMOTIVE',
            category: 'GENERAL',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'ACTIVE',
            score: 71,
            priority: 'HIGH',
            targetCustomer: 'OEMs: Tata, Mahindra, Maruti',
            targetMarket: 'India Automotive Market',
            estimatedValue: 4200000,
            currency: 'INR',
            startDate: new Date('2023-10-01'),
            targetDate: new Date('2026-09-30'),
            ownerId: admin.id,
            tags: ['automotive', 'OEM', 'EV'],
        },
    });
    const powertrainBiz = await prisma.business.create({
        data: {
            name: 'Powertrain Solutions',
            description: 'Engine management systems, transmission controllers, hybrid drivetrain',
            sector: 'AUTOMOTIVE',
            category: 'POWERTRAIN',
            productNature: 'ELECTRONIC',
            stage: 'ACTIVE',
            score: 76,
            priority: 'HIGH',
            targetCustomer: 'Tata Motors, Mahindra',
            estimatedValue: 1800000,
            parentId: autoBiz.id,
            ownerId: manager.id,
        },
    });
    await prisma.business.create({
        data: {
            name: 'ADAS & Safety Systems',
            description: 'Advanced driver assistance: lane keep, collision avoidance, adaptive cruise',
            sector: 'AUTOMOTIVE',
            category: 'ADAS',
            productNature: 'ELECTRONIC',
            stage: 'EXPLORING',
            score: 65,
            priority: 'MEDIUM',
            targetCustomer: 'Premium OEM Segment',
            estimatedValue: 1500000,
            parentId: autoBiz.id,
            ownerId: admin.id,
        },
    });
    await prisma.project.create({
        data: {
            name: 'Hybrid Drivetrain Controller',
            description: 'Power management ECU for hybrid vehicle drivetrain',
            businessId: powertrainBiz.id,
            type: 'PRODUCT',
            productNature: 'ELECTRONIC',
            status: 'DEVELOPMENT',
            score: 78,
            progress: 55,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2025-10-31'),
            budget: 700000,
            customer: 'Tata Motors',
            customerContact: 'Mr. Kapoor',
        },
    });
    // ─── CLIMATE CONTROL BUSINESSES ────────────────────────────────────────────
    const hvacBiz = await prisma.business.create({
        data: {
            name: 'Climate Control Division',
            description: 'Commercial, industrial and automotive AC systems and controls',
            sector: 'CLIMATE_CONTROL',
            category: 'GENERAL',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'ACTIVE',
            score: 66,
            priority: 'MEDIUM',
            targetCustomer: 'Building contractors, Industrial plants',
            estimatedValue: 2800000,
            currency: 'INR',
            startDate: new Date('2024-06-01'),
            targetDate: new Date('2027-06-30'),
            ownerId: manager.id,
            tags: ['HVAC', 'AC', 'climate'],
        },
    });
    await prisma.business.create({
        data: {
            name: 'Commercial AC Systems',
            description: 'VRF and chiller systems for commercial buildings',
            sector: 'CLIMATE_CONTROL',
            category: 'COMMERCIAL_AC',
            productNature: 'ELECTRO_MECHANICAL',
            stage: 'PROPOSAL',
            score: 70,
            priority: 'MEDIUM',
            estimatedValue: 1200000,
            parentId: hvacBiz.id,
            ownerId: manager.id,
        },
    });
    await prisma.business.create({
        data: {
            name: 'Industrial Cooling Solutions',
            description: 'Heavy-duty industrial process cooling and climate control',
            sector: 'CLIMATE_CONTROL',
            category: 'INDUSTRIAL_AC',
            productNature: 'MECHANICAL',
            stage: 'EXPLORING',
            score: 60,
            priority: 'MEDIUM',
            estimatedValue: 900000,
            parentId: hvacBiz.id,
            ownerId: admin.id,
        },
    });
    // ─── MILESTONES ────────────────────────────────────────────────────────────
    await prisma.milestone.createMany({
        data: [
            {
                businessId: radarBiz.id,
                title: 'Customer Demonstration Day',
                description: 'Live demo of radar prototype to Indian Army evaluation team',
                dueDate: new Date('2025-04-30'),
                status: 'PENDING',
            },
            {
                businessId: respBiz.id,
                title: 'CDSCO Regulatory Submission',
                description: 'Submit device master file to CDSCO',
                dueDate: new Date('2025-03-31'),
                status: 'IN_PROGRESS',
            },
            {
                businessId: autoBiz.id,
                title: 'OEM Approval Gate Review',
                description: 'Tata Motors supplier approval milestone',
                dueDate: new Date('2025-05-15'),
                status: 'PENDING',
            },
            {
                businessId: defenceBiz.id,
                title: 'DRDO MoU Signing',
                description: 'Sign cooperation MoU with DRDO for joint development',
                dueDate: new Date('2025-03-15'),
                status: 'COMPLETED',
                completedAt: new Date('2025-03-10'),
            },
            {
                businessId: medicalBiz.id,
                title: 'Hospital Pilot Program Launch',
                description: 'Launch pilot at 3 hospitals for ventilator evaluation',
                dueDate: new Date('2025-06-01'),
                status: 'PENDING',
            },
        ],
    });
    // ─── CUSTOMER FEEDBACK ─────────────────────────────────────────────────────
    await prisma.customerFeedback.createMany({
        data: [
            {
                businessId: radarBiz.id,
                customerName: 'Brig. R. Sharma',
                customerOrg: 'Indian Army Signal Corps',
                sentiment: 'POSITIVE',
                rating: 4,
                feedback: 'Prototype performance exceeded expectations. Range accuracy is impressive.',
                date: new Date('2025-01-20'),
            },
            {
                businessId: respBiz.id,
                customerName: 'Dr. Ramesh Patel',
                customerOrg: 'Apollo Hospitals',
                sentiment: 'POSITIVE',
                rating: 5,
                feedback: 'The V200 ventilator interface is intuitive. ICU team is very satisfied.',
                date: new Date('2025-02-10'),
            },
            {
                businessId: medicalBiz.id,
                customerName: 'Dr. Priya Menon',
                customerOrg: 'AIIMS New Delhi',
                sentiment: 'REQUIREMENT',
                rating: 3,
                feedback: 'We need multi-gas monitoring integration. Current SpO2 monitoring is good but needs EtCO2.',
                date: new Date('2025-01-15'),
            },
            {
                businessId: autoBiz.id,
                customerName: 'Mr. Vikram Kapoor',
                customerOrg: 'Tata Motors Engineering',
                sentiment: 'NEUTRAL',
                rating: 3,
                feedback: 'Controller performance meets spec but packaging needs to fit engine bay constraints better.',
                date: new Date('2025-02-05'),
            },
            {
                businessId: droneBiz.id,
                customerName: 'Col. Anand Kumar',
                customerOrg: 'Army Aviation Corps',
                sentiment: 'POSITIVE',
                rating: 4,
                feedback: 'Concept aligns with operational requirements. 4hr endurance target is achievable.',
                date: new Date('2025-01-28'),
            },
        ],
    });
    // ─── ACTIVITY LOGS ─────────────────────────────────────────────────────────
    await prisma.activityLog.createMany({
        data: [
            { businessId: defenceBiz.id, userId: admin.id, action: 'CREATED', description: 'Defence Electronics Division created' },
            { businessId: radarBiz.id, userId: manager.id, action: 'STAGE_CHANGE', description: 'Stage moved from EXPLORING to PROPOSAL' },
            { businessId: respBiz.id, userId: manager.id, action: 'SCORE_UPDATE', description: 'Opportunity score updated to 80' },
            { businessId: autoBiz.id, userId: admin.id, action: 'FEEDBACK_ADDED', description: 'Feedback from Tata Motors received' },
            { businessId: medicalBiz.id, userId: admin.id, action: 'MILESTONE_COMPLETED', description: 'DRDO MoU milestone completed' },
        ],
    });
    console.log('\nSeeding complete!');
    console.log('Admin: admin@bd.local / admin123');
    console.log('Manager: manager@bd.local / admin123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
