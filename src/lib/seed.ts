export type User = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  plan: "individual" | "family";
  location: string;
  avatar?: string;
};

export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  species: "Cat" | "Dog" | "Bird" | "Rabbit" | "Other";
  breed: string;
  gender: "Male" | "Female";
  ageYears: number;
  weightKg: number;
  vaccinated: boolean;
  spotOnDueDays: number;
  photo?: string;
  healthScore: number;
  wellnessScore: number;
  conditions?: string[];
  notes?: string;
};

export type MedicalRecord = {
  id: string;
  petId: string;
  title: string;
  type: "CBC" | "Blood" | "Urine" | "Stool" | "Prescription" | "Consultation" | "Vaccination" | "Other";
  date: string; // ISO
  fileName?: string;
  summary?: string;
  vet?: string;
};

export type Notification = {
  id: string;
  type: "vaccination" | "spotOn" | "medication" | "appointment" | "subscription" | "insight";
  title: string;
  body: string;
  date: string;
  read: boolean;
  petId?: string;
};

export type Vet = {
  id: string;
  kind: "Hospital" | "Clinic" | "Veterinarian" | "Specialist";
  name: string;
  specialty?: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  phone: string;
  address: string;
  city: string;
  country: "India" | "Pakistan" | "Sri Lanka" | "Thailand";
  lat: number;
  lng: number;
};

export type Review = {
  id: string;
  vetId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
};

export type AppState = {
  currentUserId: string | null;
  users: User[];
  pets: Pet[];
  records: MedicalRecord[];
  notifications: Notification[];
  vets: Vet[];
  reviews: Review[];
  darkMode: boolean;
};

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export function initialState(): AppState {
  const demoUser: User = {
    id: "u_demo",
    fullName: "Raj Tahseen",
    email: "demouser@petcarebuddy.app",
    mobile: "+91 98765 43210",
    password: "demouser",
    plan: "family",
    location: "Hyderabad, India",
  };

  const admin: User = {
    id: "u_admin",
    fullName: "Admin",
    email: "admin",
    mobile: "",
    password: "admin",
    plan: "family",
    location: "",
  };

  const pets: Pet[] = [
    {
      id: "p_laddu", ownerId: "u_demo", name: "Laddu", species: "Cat", breed: "Calico",
      gender: "Female", ageYears: 5, weightKg: 5.5, vaccinated: true, spotOnDueDays: 30,
      healthScore: 91, wellnessScore: 94, conditions: ["Mild Vitamin Deficiency"], notes: "Stable CBC, weight steady.",
    },
    {
      id: "p_moti", ownerId: "u_demo", name: "Motichoor", species: "Cat", breed: "Calico",
      gender: "Female", ageYears: 5, weightKg: 5.5, vaccinated: true, spotOnDueDays: 30,
      healthScore: 89, wellnessScore: 92, notes: "Healthy reports, normal blood markers.",
    },
    {
      id: "p_neil", ownerId: "u_demo", name: "Neil", species: "Cat", breed: "Calico",
      gender: "Male", ageYears: 3, weightKg: 4.5, vaccinated: false, spotOnDueDays: 30,
      healthScore: 72, wellnessScore: 68, conditions: ["Incomplete Vaccination", "Mild Anemia Indicators"],
      notes: "Follow-up wellness check recommended.",
    },
  ];

  const records: MedicalRecord[] = [
    { id: "r1", petId: "p_laddu", title: "CBC Report — June", type: "CBC", date: daysAgo(12), summary: "All values within normal range. Mild Vitamin D low.", vet: "Dr. Anita Rao", fileName: "laddu-cbc-jun.pdf" },
    { id: "r2", petId: "p_laddu", title: "Vet Consultation", type: "Consultation", date: daysAgo(30), summary: "Routine wellness review. Continue vitamin supplement.", vet: "Dr. Anita Rao" },
    { id: "r3", petId: "p_laddu", title: "Vaccination — FVRCP Booster", type: "Vaccination", date: daysAgo(90), vet: "Dr. Anita Rao" },
    { id: "r4", petId: "p_moti", title: "Blood Report", type: "Blood", date: daysAgo(20), summary: "Hemoglobin, WBC, platelets all normal.", vet: "Dr. Anita Rao", fileName: "moti-blood.pdf" },
    { id: "r5", petId: "p_moti", title: "Urine Analysis", type: "Urine", date: daysAgo(20), summary: "Clear, no infection markers.", vet: "Dr. Anita Rao" },
    { id: "r6", petId: "p_moti", title: "Prescription — Deworming", type: "Prescription", date: daysAgo(45), summary: "Drontal Cat — single dose.", vet: "Dr. Anita Rao" },
    { id: "r7", petId: "p_neil", title: "Stool Report", type: "Stool", date: daysAgo(8), summary: "Trace parasites — deworming advised.", vet: "Dr. Kiran Mehta" },
    { id: "r8", petId: "p_neil", title: "CBC Report", type: "CBC", date: daysAgo(8), summary: "Hemoglobin slightly below range — monitor.", vet: "Dr. Kiran Mehta", fileName: "neil-cbc.pdf" },
    { id: "r9", petId: "p_neil", title: "Vet Consultation", type: "Consultation", date: daysAgo(7), summary: "Recommended catch-up vaccination schedule.", vet: "Dr. Kiran Mehta" },
  ];

  const notifications: Notification[] = [
    { id: "n1", type: "vaccination", title: "Vaccination due for Neil", body: "FVRCP catch-up scheduled for next week.", date: daysAhead(5), read: false, petId: "p_neil" },
    { id: "n2", type: "spotOn", title: "Spot-On reminder", body: "Laddu and Motichoor — Spot-On due in 30 days.", date: daysAhead(30), read: false },
    { id: "n3", type: "insight", title: "Monthly health review ready", body: "Tap the Companion bubble to view all 3 pets.", date: now(), read: false },
    { id: "n4", type: "subscription", title: "Family plan active", body: "Renews on " + new Date(Date.now() + 86400000 * 60).toLocaleDateString(), date: daysAgo(2), read: true },
  ];

  const vets: Vet[] = [
    { id: "v1", kind: "Hospital", name: "Cessna Lifeline Veterinary Hospital", specialty: "Multi-specialty", experienceYears: 18, rating: 4.8, reviewsCount: 612, phone: "+91 80 4970 1500", address: "Doddanekkundi, Bengaluru", city: "Bengaluru", country: "India", lat: 12.97, lng: 77.71 },
    { id: "v2", kind: "Clinic", name: "Happy Tails Pet Clinic", specialty: "General practice", experienceYears: 10, rating: 4.6, reviewsCount: 184, phone: "+91 40 2345 6789", address: "Banjara Hills, Hyderabad", city: "Hyderabad", country: "India", lat: 17.41, lng: 78.44 },
    { id: "v3", kind: "Veterinarian", name: "Dr. Anita Rao", specialty: "Feline Medicine", experienceYears: 14, rating: 4.9, reviewsCount: 221, phone: "+91 98765 11111", address: "Jubilee Hills, Hyderabad", city: "Hyderabad", country: "India", lat: 17.43, lng: 78.41 },
    { id: "v4", kind: "Specialist", name: "Dr. Kiran Mehta", specialty: "Internal Medicine", experienceYears: 20, rating: 4.7, reviewsCount: 158, phone: "+91 98765 22222", address: "Gachibowli, Hyderabad", city: "Hyderabad", country: "India", lat: 17.44, lng: 78.35 },
    { id: "v5", kind: "Hospital", name: "Karachi Animal Hospital", experienceYears: 22, rating: 4.5, reviewsCount: 98, phone: "+92 21 3456 7890", address: "Clifton, Karachi", city: "Karachi", country: "Pakistan", lat: 24.81, lng: 67.03 },
    { id: "v6", kind: "Clinic", name: "Colombo Pet Care", experienceYears: 9, rating: 4.4, reviewsCount: 72, phone: "+94 11 234 5678", address: "Colombo 05", city: "Colombo", country: "Sri Lanka", lat: 6.87, lng: 79.86 },
    { id: "v7", kind: "Hospital", name: "Thonglor Pet Hospital", experienceYears: 25, rating: 4.9, reviewsCount: 1024, phone: "+66 2 712 6301", address: "Sukhumvit 55, Bangkok", city: "Bangkok", country: "Thailand", lat: 13.73, lng: 100.58 },
  ];

  return {
    currentUserId: null,
    users: [demoUser, admin],
    pets,
    records,
    notifications,
    vets,
    reviews: [
      { id: "rv1", vetId: "v3", userId: "u_demo", userName: "Raj Tahseen", rating: 5, text: "Dr. Anita is gentle and thorough — my cats love her.", date: daysAgo(40) },
      { id: "rv2", vetId: "v1", userId: "u_demo", userName: "Raj Tahseen", rating: 5, text: "Top facility, very clean and responsive.", date: daysAgo(120) },
    ],
    darkMode: false,
  };
}
