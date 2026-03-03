import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'

export const cn = (...args) => twMerge(clsx(...args))
export const formatDate     = (d) => format(new Date(d), 'MMM d, yyyy')
export const formatTime     = (d) => format(new Date(d), 'h:mm a')
export const formatDateTime = (d) => format(new Date(d), 'MMM d, yyyy h:mm a')
export const timeAgo        = (d) => formatDistanceToNow(new Date(d), { addSuffix: true })
export const isSessionPast  = (d) => isPast(new Date(d))

export const LEVEL_COLORS = {
  Beginner:     'pill-lime',
  Intermediate: 'pill-yellow',
  Advanced:     'pill-fire',
}
export const STATUS_COLORS = {
  upcoming:  'pill-ocean',
  live:      'pill-lime',
  completed: 'bg-white/8 text-white/40 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  cancelled: 'pill-fire',
  draft:     'pill-yellow',
}

export const SKILL_CATEGORIES = [
  // 🍳 Food & Culinary
  'Cooking', 'Baking & Pastry', 'Indian Regional Cuisine', 'Continental Cuisine',
  'Chinese & Asian Cooking', 'Vegan & Vegetarian Cooking', 'Meal Planning & Nutrition',
  'Fermentation & Pickling', 'Street Food & Snacks', 'Cake Decoration',
  'Barista & Coffee Art', 'Chocolate Making', 'Mixology & Mocktails',

  // 🎨 Arts & Crafts
  'Drawing & Sketching', 'Painting', 'Watercolor', 'Oil Painting', 'Acrylic Painting',
  'Sculpture & Pottery', 'Origami & Paper Crafts', 'Knitting & Crocheting',
  'Embroidery & Sewing', 'Jewelry Making', 'Candle & Soap Making',
  'DIY & Upcycling', 'Mehendi & Henna', 'Rangoli', 'Calligraphy & Lettering',
  'Resin Art', 'Macramé', 'Block Printing', 'Leather Crafting',

  // 🎵 Music
  'Guitar', 'Piano & Keyboard', 'Tabla & Dholak', 'Sitar & Veena',
  'Violin', 'Flute', 'Harmonium', 'Vocals & Singing',
  'Carnatic Music', 'Hindustani Classical', 'Music Theory & Composition',
  'Music Production & DJ', 'Drums & Percussion', 'Saxophone', 'Bass Guitar',
  'Ukulele', 'Mouth Organ & Harmonica',

  // 💃 Dance
  'Bharatanatyam', 'Kathak', 'Kuchipudi', 'Odissi', 'Manipuri',
  'Bollywood Dance', 'Folk Dance', 'Contemporary Dance', 'Ballet',
  'Hip-Hop Dance', 'Salsa & Latin Dance', 'Zumba', 'Freestyle Dance',
  'Aerial & Acrobatics',

  // 🎭 Performing Arts
  'Acting & Theater', 'Stand-up Comedy', 'Storytelling', 'Mime & Puppetry',
  'Voice Acting', 'Public Speaking', 'Anchoring & Hosting', 'Improv Comedy',
  'Radio Jockeying', 'Podcast Hosting',

  // 🌐 Languages
  'English Communication', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Marathi', 'Bengali', 'Punjabi', 'Gujarati', 'Odia',
  'Urdu', 'Sanskrit', 'Spanish', 'French', 'German', 'Japanese',
  'Mandarin Chinese', 'Arabic', 'Korean', 'Italian', 'Portuguese',
  'Russian', 'Sign Language',

  // 💻 Technology & Digital
  'Python Programming', 'JavaScript & Web Dev', 'React & Frontend',
  'Node.js & Backend', 'Mobile App Development', 'Machine Learning & AI',
  'Data Science', 'Cloud Computing', 'Cybersecurity', 'Game Development',
  'Blockchain & Web3', 'DevOps & CI/CD', 'Database & SQL',
  'Excel & Google Sheets', 'Video Editing', '3D Modeling & Animation',
  'WordPress & CMS', 'SEO & Digital Marketing', 'Social Media Management',
  'E-commerce & Dropshipping', 'Automation & RPA', 'UI/UX Design',
  'Graphic Design', 'Product Management', 'Prompt Engineering & AI Tools',
  'No-Code & Low-Code Tools', 'Coding for Beginners',

  // 💼 Business & Finance
  'Entrepreneurship', 'Business Strategy', 'Personal Finance',
  'Stock Market & Investing', 'Mutual Funds & SIP', 'Cryptocurrency',
  'Accounting & Bookkeeping', 'Sales Techniques', 'Negotiation Skills',
  'Leadership & Management', 'Project Management', 'HR & Recruitment',
  'Legal Basics & Contracts', 'GST & Taxation', 'Insurance Planning',
  'Real Estate Investing', 'Startup Fundraising', 'Content Creation',
  'Freelancing & Consulting', 'Brand Building',

  // 🏋️ Health & Fitness
  'Yoga', 'Meditation & Mindfulness', 'Gym & Weight Training',
  'CrossFit & HIIT', 'Running & Marathon Training', 'Swimming', 'Cycling',
  'Martial Arts', 'Kalaripayattu', 'Pilates', 'Aerobics',
  'Nutrition & Diet Planning', 'Ayurveda', 'Physiotherapy Basics',
  'Mental Health & Wellbeing', 'Stretching & Flexibility',

  // 🏏 Sports Coaching
  'Cricket Coaching', 'Football Coaching', 'Badminton Coaching',
  'Tennis Coaching', 'Basketball Coaching', 'Chess',
  'Table Tennis', 'Archery', 'Kabaddi', 'Kho-Kho',
  'Volleyball Coaching', 'Skating & Rollerskating',

  // 📚 Academic & Exam Prep
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
  'Geography', 'Economics', 'Political Science', 'Philosophy',
  'Research & Academic Writing', 'UPSC Preparation', 'GATE Preparation',
  'CA & CFA Preparation', 'IELTS & TOEFL', 'GRE & GMAT',
  'Abacus & Mental Math', 'Coding for Kids', 'Robotics for Kids',

  // 📸 Photography & Media
  'Photography', 'Portrait Photography', 'Wildlife Photography',
  'Videography & Filmmaking', 'Drone Photography', 'Photo Editing',
  'Podcast Production', 'YouTube Content Creation', 'Reel Making',

  // 🏡 Home & Lifestyle
  'Gardening & Plants', 'Home Repair & Plumbing', 'Electrical Basics',
  'Interior Design & Decoration', 'Furniture Making & Woodworking',
  'Automobile Basics & Driving Tips', 'Cycling Repair', 'Smart Home Setup',
  'Decluttering & Minimalism', 'Vastu & Feng Shui',

  // 👗 Fashion & Beauty
  'Fashion Design', 'Personal Styling', 'Makeup & Beauty',
  'Skincare & Grooming', 'Hairstyling', 'Nail Art', 'Wardrobe Curation',

  // 👨‍👩‍👧 Parenting & Family
  'Parenting Skills', 'Child Development', 'Homeschooling',
  'Elder Care', 'Pet Training & Care', 'First Aid & CPR',
  'Relationship Skills', 'Marriage Counselling Basics',

  // ✈️ Travel & Culture
  'Travel Planning & Backpacking', 'Camping & Survival Skills',
  'Astrology & Vedic Astrology', 'Mythology & Indian Culture',
  'Genealogy & Family History', 'Event Planning & Management',

  // 🧘 Spiritual & Wellness
  'Reiki & Energy Healing', 'Tarot & Oracle Reading', 'Numerology',
  'Journaling & Self-Reflection', 'Life Coaching', 'NLP & Hypnotherapy',
  'Crystal Healing', 'Palmistry', 'Pranic Healing',

  // ✍️ Writing & Literature
  'Creative Writing', 'Content Writing', 'Copywriting',
  'Screenplay & Script Writing', 'Poetry', 'Blogging',
  'Journalism & Reporting', 'Book Writing & Publishing',

  // 🪄 Hobbies & Fun
  'Magic Tricks & Illusion', 'Rubik\'s Cube Solving', 'Model Building',
  'Bird Watching', 'Stargazing & Astronomy', 'Coin & Stamp Collecting',
  'Board Games & Strategy', 'Speedcubing', 'Lego & Mechanical Kits',

  'Other',
]
export const truncate       = (str, n = 100) => str?.length > n ? str.slice(0, n) + '…' : str
export const getInitials    = (name) => name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
export const formatCredits  = (n) => n !== undefined && n !== null ? Number(n).toFixed(0) : '0'
