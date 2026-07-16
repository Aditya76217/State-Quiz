/**
 * @fileoverview Database seeding script for the Which State Am I quiz application.
 * Seeds all 28 Indian states and 8 Union Territories with comprehensive data,
 * including 200+ educational clues across various categories and difficulties.
 *
 * Usage: node database/seed.js
 * @module database/seed
 */

const { db } = require('./db');

/**
 * State data structure for seeding.
 * @typedef {Object} StateData
 * @property {string} name - State/UT name
 * @property {string} capital - Capital city
 * @property {string} region - Geographic region
 * @property {string} famous_for - What the state is famous for
 * @property {string} fun_fact - An interesting fact
 * @property {number} statehood_year - Year of formation/statehood
 * @property {string} official_language - Primary official language
 * @property {Array<{text: string, type: string, difficulty: string}>} clues - Array of clue objects
 */

/** @type {StateData[]} */
const statesData = [
  // ─────────────────────────────────────────
  // STATES (28)
  // ─────────────────────────────────────────
  {
    name: 'Andhra Pradesh',
    capital: 'Amaravati',
    region: 'South',
    famous_for: 'Tirupati Temple',
    fun_fact: 'Has the longest coastline in South India',
    statehood_year: 1956,
    official_language: 'Telugu',
    clues: [
      { text: 'This state is home to the famous Tirupati Balaji temple, the richest temple in the world', type: 'landmark', difficulty: 'easy' },
      { text: 'The Kuchipudi classical dance form originated here', type: 'culture', difficulty: 'medium' },
      { text: 'Hyderabadi Biryani was once associated with this region before it was split', type: 'food', difficulty: 'hard' },
      { text: 'The Krishna and Godavari rivers create fertile deltas in this state', type: 'geography', difficulty: 'medium' },
      { text: 'Ugadi, the Telugu New Year, is widely celebrated here', type: 'festival', difficulty: 'easy' },
      { text: 'Amaravati, the planned capital city, is being built along the Krishna River', type: 'landmark', difficulty: 'hard' },
    ],
  },
  {
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    region: 'Northeast',
    famous_for: 'Tawang Monastery',
    fun_fact: "Known as the 'Land of the Rising Sun'",
    statehood_year: 1987,
    official_language: 'English',
    clues: [
      { text: 'This state is known as the Land of the Rising Sun as it sees the first sunrise in India', type: 'geography', difficulty: 'easy' },
      { text: 'The Tawang Monastery, the largest in India, is located here', type: 'landmark', difficulty: 'medium' },
      { text: 'Home to over 26 major tribes and 100 sub-tribes', type: 'culture', difficulty: 'hard' },
      { text: 'The Sela Pass at 13,700 feet connects Tawang to the rest of this state', type: 'geography', difficulty: 'hard' },
      { text: 'Losar festival marking Tibetan New Year is celebrated in parts of this state', type: 'festival', difficulty: 'medium' },
    ],
  },
  {
    name: 'Assam',
    capital: 'Dispur',
    region: 'Northeast',
    famous_for: 'Kaziranga National Park',
    fun_fact: "Produces more than half of India's tea",
    statehood_year: 1950,
    official_language: 'Assamese',
    clues: [
      { text: 'This state is home to the Kaziranga National Park, famous for one-horned rhinoceros', type: 'wildlife', difficulty: 'easy' },
      { text: 'The Bihu festival is celebrated with great fervor here', type: 'festival', difficulty: 'medium' },
      { text: "This state produces more than half of India's tea", type: 'geography', difficulty: 'hard' },
      { text: 'The mighty Brahmaputra river flows through this state', type: 'geography', difficulty: 'easy' },
      { text: "Majuli, the world's largest river island, is found here", type: 'geography', difficulty: 'medium' },
      { text: 'This state is famous for its Muga silk, the golden silk', type: 'culture', difficulty: 'hard' },
    ],
  },
  {
    name: 'Bihar',
    capital: 'Patna',
    region: 'East',
    famous_for: "Bodh Gaya (Buddha's enlightenment)",
    fun_fact: "Home to the world's oldest university, Nalanda",
    statehood_year: 1950,
    official_language: 'Hindi',
    clues: [
      { text: 'Lord Buddha attained enlightenment at Bodh Gaya in this state', type: 'history', difficulty: 'easy' },
      { text: "The ancient university of Nalanda, one of the world's first, was located here", type: 'history', difficulty: 'medium' },
      { text: 'Chhath Puja, dedicated to the Sun God, is most prominently celebrated here', type: 'festival', difficulty: 'easy' },
      { text: "The Sonepur Cattle Fair, Asia's largest, is held here", type: 'culture', difficulty: 'hard' },
      { text: 'Litti Chokha is the signature dish of this state', type: 'food', difficulty: 'medium' },
    ],
  },
  {
    name: 'Chhattisgarh',
    capital: 'Raipur',
    region: 'Central',
    famous_for: 'Chitrakote Falls (Niagara of India)',
    fun_fact: 'One of the richest states in mineral resources',
    statehood_year: 2000,
    official_language: 'Hindi',
    clues: [
      { text: 'Chitrakote Falls, known as the Niagara Falls of India, is located here', type: 'landmark', difficulty: 'easy' },
      { text: 'This state is one of the richest in terms of mineral resources and diamonds', type: 'geography', difficulty: 'medium' },
      { text: 'The Bastar Dussehra festival lasts for 75 days, making it the longest in the world', type: 'festival', difficulty: 'hard' },
      { text: 'Dense Sal forests cover about 44% of this state', type: 'geography', difficulty: 'hard' },
      { text: 'This state was carved out of Madhya Pradesh in the year 2000', type: 'history', difficulty: 'medium' },
    ],
  },
  {
    name: 'Goa',
    capital: 'Panaji',
    region: 'West',
    famous_for: 'Beaches and Portuguese heritage',
    fun_fact: 'Smallest state by area in India',
    statehood_year: 1987,
    official_language: 'Konkani',
    clues: [
      { text: 'This is the smallest state in India by area', type: 'geography', difficulty: 'easy' },
      { text: 'Famous for its Portuguese colonial architecture and churches', type: 'culture', difficulty: 'medium' },
      { text: 'The Carnival festival celebrated here reflects its Portuguese heritage', type: 'festival', difficulty: 'medium' },
      { text: "Basilica of Bom Jesus, a UNESCO World Heritage Site, houses St. Francis Xavier's remains here", type: 'landmark', difficulty: 'hard' },
      { text: 'Fish curry rice (Xitt Kodi) is the staple food here', type: 'food', difficulty: 'easy' },
      { text: 'This state was liberated from Portuguese rule in 1961', type: 'history', difficulty: 'hard' },
    ],
  },
  {
    name: 'Gujarat',
    capital: 'Gandhinagar',
    region: 'West',
    famous_for: 'Gir National Park (Asiatic Lions)',
    fun_fact: 'Birthplace of Mahatma Gandhi',
    statehood_year: 1960,
    official_language: 'Gujarati',
    clues: [
      { text: 'The Gir National Park, the only home of Asiatic lions, is in this state', type: 'wildlife', difficulty: 'easy' },
      { text: 'Mahatma Gandhi, the Father of the Nation, was born in Porbandar in this state', type: 'history', difficulty: 'easy' },
      { text: 'The Rann of Kutch, a vast white salt desert, is found here', type: 'geography', difficulty: 'medium' },
      { text: 'Navratri is celebrated here with the famous Garba and Dandiya Raas dances', type: 'festival', difficulty: 'medium' },
      { text: "The Statue of Unity, the world's tallest statue, stands here", type: 'landmark', difficulty: 'easy' },
      { text: 'Dhokla and Thepla are iconic snacks from this state', type: 'food', difficulty: 'hard' },
    ],
  },
  {
    name: 'Haryana',
    capital: 'Chandigarh',
    region: 'North',
    famous_for: 'Kurukshetra (Mahabharata battlefield)',
    fun_fact: 'Shares its capital with Punjab',
    statehood_year: 1966,
    official_language: 'Hindi',
    clues: [
      { text: 'The ancient battlefield of Kurukshetra, from the Mahabharata, is in this state', type: 'history', difficulty: 'easy' },
      { text: 'This state shares its capital city with Punjab', type: 'geography', difficulty: 'medium' },
      { text: 'Known as a hub for automobile manufacturing in India', type: 'culture', difficulty: 'hard' },
      { text: 'Traditionally known for its wrestling and kabaddi culture', type: 'culture', difficulty: 'medium' },
      { text: 'Surajkund Crafts Mela, an international crafts fair, is held here', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Himachal Pradesh',
    capital: 'Shimla',
    region: 'North',
    famous_for: 'Hill stations and apple orchards',
    fun_fact: "Known as 'Dev Bhoomi' (Land of Gods)",
    statehood_year: 1971,
    official_language: 'Hindi',
    clues: [
      { text: 'Known as "Dev Bhoomi" meaning Land of Gods', type: 'culture', difficulty: 'easy' },
      { text: 'Shimla, its capital, was the summer capital of British India', type: 'history', difficulty: 'medium' },
      { text: 'This state is the largest producer of apples in India', type: 'geography', difficulty: 'medium' },
      { text: 'The Kullu Dussehra festival is internationally famous', type: 'festival', difficulty: 'easy' },
      { text: 'Rohtang Pass is a popular gateway to Lahaul and Spiti in this state', type: 'geography', difficulty: 'hard' },
      { text: 'Siddu and Dham are traditional dishes of this state', type: 'food', difficulty: 'hard' },
    ],
  },
  {
    name: 'Jharkhand',
    capital: 'Ranchi',
    region: 'East',
    famous_for: 'Betla National Park',
    fun_fact: "Name means 'Land of Forests'",
    statehood_year: 2000,
    official_language: 'Hindi',
    clues: [
      { text: 'The name of this state means "Land of Forests"', type: 'history', difficulty: 'easy' },
      { text: 'This state was carved out of Bihar in the year 2000', type: 'history', difficulty: 'medium' },
      { text: 'Betla National Park is a tiger reserve located here', type: 'wildlife', difficulty: 'medium' },
      { text: 'Rich in mineral resources, it is called the "Ruhr of India"', type: 'geography', difficulty: 'hard' },
      { text: 'Sarhul festival celebrating the Sal tree blossoming is popular here', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Karnataka',
    capital: 'Bengaluru',
    region: 'South',
    famous_for: 'IT Hub of India & Hampi ruins',
    fun_fact: 'Has the most UNESCO World Heritage Sites in South India',
    statehood_year: 1956,
    official_language: 'Kannada',
    clues: [
      { text: 'Bengaluru, the IT capital of India, is the capital of this state', type: 'geography', difficulty: 'easy' },
      { text: 'The ruins of Hampi, a UNESCO World Heritage Site, are located here', type: 'landmark', difficulty: 'easy' },
      { text: 'Mysore Palace is one of the most visited monuments in this state', type: 'landmark', difficulty: 'medium' },
      { text: 'Coorg, known as the Scotland of India, is a hill station here', type: 'geography', difficulty: 'medium' },
      { text: 'This state celebrates Dasara in Mysore with a grand procession', type: 'festival', difficulty: 'hard' },
      { text: 'Bisi Bele Bath and Masala Dosa are iconic dishes from here', type: 'food', difficulty: 'medium' },
    ],
  },
  {
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    region: 'South',
    famous_for: 'Backwaters and Ayurveda',
    fun_fact: 'First state to achieve 100% literacy',
    statehood_year: 1956,
    official_language: 'Malayalam',
    clues: [
      { text: 'Known as "God\'s Own Country" for its natural beauty', type: 'geography', difficulty: 'easy' },
      { text: 'This was the first state in India to achieve 100% literacy', type: 'history', difficulty: 'easy' },
      { text: 'The Kathakali dance form originated in this state', type: 'culture', difficulty: 'medium' },
      { text: 'Famous for its network of backwaters and houseboats in Alleppey', type: 'geography', difficulty: 'medium' },
      { text: 'Onam festival is celebrated with elaborate Sadya feasts here', type: 'festival', difficulty: 'medium' },
      { text: 'Ayurveda, the ancient system of medicine, has deep roots here', type: 'culture', difficulty: 'hard' },
    ],
  },
  {
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    region: 'Central',
    famous_for: 'Khajuraho temples',
    fun_fact: 'Largest state by area until 2000',
    statehood_year: 1956,
    official_language: 'Hindi',
    clues: [
      { text: 'The Khajuraho temples with intricate sculptures are located here', type: 'landmark', difficulty: 'easy' },
      { text: 'Known as the "Heart of India" due to its central location', type: 'geography', difficulty: 'easy' },
      { text: 'Kanha and Bandhavgarh National Parks are famous tiger reserves here', type: 'wildlife', difficulty: 'medium' },
      { text: 'The Sanchi Stupa, a Buddhist monument, is a UNESCO site here', type: 'landmark', difficulty: 'medium' },
      { text: 'This was the largest Indian state by area until Chhattisgarh was carved out in 2000', type: 'history', difficulty: 'hard' },
      { text: 'Poha and Jalebi is the quintessential breakfast combination here', type: 'food', difficulty: 'hard' },
    ],
  },
  {
    name: 'Maharashtra',
    capital: 'Mumbai',
    region: 'West',
    famous_for: 'Bollywood and Ajanta-Ellora Caves',
    fun_fact: "Home to India's financial capital",
    statehood_year: 1960,
    official_language: 'Marathi',
    clues: [
      { text: 'Mumbai, the financial capital of India, is in this state', type: 'geography', difficulty: 'easy' },
      { text: 'Bollywood, the Hindi film industry, is headquartered here', type: 'culture', difficulty: 'easy' },
      { text: 'The Ajanta and Ellora caves are UNESCO World Heritage Sites here', type: 'landmark', difficulty: 'medium' },
      { text: 'Ganesh Chaturthi is celebrated with massive public pandals here', type: 'festival', difficulty: 'medium' },
      { text: 'Vada Pav is the iconic street food of this state', type: 'food', difficulty: 'easy' },
      { text: 'Shivaji Maharaj founded the Maratha Empire from this region', type: 'history', difficulty: 'hard' },
    ],
  },
  {
    name: 'Manipur',
    capital: 'Imphal',
    region: 'Northeast',
    famous_for: 'Loktak Lake (floating lake)',
    fun_fact: 'Birthplace of modern polo',
    statehood_year: 1972,
    official_language: 'Meitei',
    clues: [
      { text: 'Loktak Lake, the largest freshwater lake in NE India with floating islands, is here', type: 'geography', difficulty: 'easy' },
      { text: 'This state is considered the birthplace of modern polo', type: 'history', difficulty: 'medium' },
      { text: 'The Sangai deer, a rare dancing deer, is found only here', type: 'wildlife', difficulty: 'hard' },
      { text: "Manipuri classical dance is one of India's eight classical dance forms", type: 'culture', difficulty: 'medium' },
      { text: 'Yaoshang, similar to Holi, is a major festival here', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Meghalaya',
    capital: 'Shillong',
    region: 'Northeast',
    famous_for: 'Living root bridges',
    fun_fact: 'Receives highest rainfall in the world (Mawsynram)',
    statehood_year: 1972,
    official_language: 'English',
    clues: [
      { text: 'Mawsynram in this state receives the highest rainfall in the world', type: 'geography', difficulty: 'easy' },
      { text: 'Famous for its unique living root bridges built by the Khasi tribe', type: 'landmark', difficulty: 'easy' },
      { text: 'The name means "Abode of Clouds"', type: 'culture', difficulty: 'medium' },
      { text: 'Shillong, its capital, is known as the "Scotland of the East"', type: 'geography', difficulty: 'medium' },
      { text: 'This is one of the few matrilineal societies in India', type: 'culture', difficulty: 'hard' },
    ],
  },
  {
    name: 'Mizoram',
    capital: 'Aizawl',
    region: 'Northeast',
    famous_for: 'Bamboo forests',
    fun_fact: 'Has the highest literacy rate among NE states',
    statehood_year: 1987,
    official_language: 'Mizo',
    clues: [
      { text: 'This state has the highest literacy rate among northeastern states', type: 'history', difficulty: 'easy' },
      { text: 'Known for its bamboo forests covering a large area of the state', type: 'geography', difficulty: 'medium' },
      { text: 'Chapchar Kut, a spring festival, is the most important festival here', type: 'festival', difficulty: 'medium' },
      { text: 'The Mizo people practice a community-based social system called Tlawmngaihna', type: 'culture', difficulty: 'hard' },
      { text: 'This state shares international borders with Myanmar and Bangladesh', type: 'geography', difficulty: 'hard' },
    ],
  },
  {
    name: 'Nagaland',
    capital: 'Kohima',
    region: 'Northeast',
    famous_for: 'Hornbill Festival',
    fun_fact: "Known as the 'Land of Festivals'",
    statehood_year: 1963,
    official_language: 'English',
    clues: [
      { text: 'Known as the "Land of Festivals"', type: 'culture', difficulty: 'easy' },
      { text: 'The Hornbill Festival, a cultural extravaganza, is held here every December', type: 'festival', difficulty: 'easy' },
      { text: 'Home to 16 major Naga tribes, each with distinct customs', type: 'culture', difficulty: 'medium' },
      { text: 'Kohima was the site of a decisive World War II battle against the Japanese', type: 'history', difficulty: 'hard' },
      { text: 'Dzukou Valley, known for its seasonal flowers, is located here', type: 'geography', difficulty: 'medium' },
    ],
  },
  {
    name: 'Odisha',
    capital: 'Bhubaneswar',
    region: 'East',
    famous_for: 'Konark Sun Temple',
    fun_fact: 'Has the largest brackish water lagoon in Asia (Chilika Lake)',
    statehood_year: 1950,
    official_language: 'Odia',
    clues: [
      { text: 'The Konark Sun Temple, shaped like a chariot, is here', type: 'landmark', difficulty: 'easy' },
      { text: "Chilika Lake, Asia's largest brackish water lagoon, is in this state", type: 'geography', difficulty: 'easy' },
      { text: 'The Rath Yatra of Puri is one of the grandest chariot festivals', type: 'festival', difficulty: 'medium' },
      { text: 'Odissi, one of the oldest surviving classical dance forms, originated here', type: 'culture', difficulty: 'medium' },
      { text: 'The Lingaraja Temple in Bhubaneswar is an architectural marvel here', type: 'landmark', difficulty: 'hard' },
    ],
  },
  {
    name: 'Punjab',
    capital: 'Chandigarh',
    region: 'North',
    famous_for: 'Golden Temple',
    fun_fact: "Known as the 'Granary of India'",
    statehood_year: 1966,
    official_language: 'Punjabi',
    clues: [
      { text: 'The Golden Temple (Harmandir Sahib) in Amritsar is in this state', type: 'landmark', difficulty: 'easy' },
      { text: 'Known as the "Granary of India" for its wheat production', type: 'geography', difficulty: 'easy' },
      { text: 'Bhangra, a lively folk dance, originated here', type: 'culture', difficulty: 'medium' },
      { text: 'Baisakhi, marking the harvest season, is a major festival here', type: 'festival', difficulty: 'medium' },
      { text: 'The Jallianwala Bagh massacre of 1919 took place here', type: 'history', difficulty: 'hard' },
      { text: 'Makki di Roti and Sarson da Saag is the iconic dish here', type: 'food', difficulty: 'medium' },
    ],
  },
  {
    name: 'Rajasthan',
    capital: 'Jaipur',
    region: 'West',
    famous_for: 'Thar Desert and forts',
    fun_fact: 'Largest state in India by area',
    statehood_year: 1950,
    official_language: 'Hindi',
    clues: [
      { text: "The Thar Desert, India's largest desert, is in this state", type: 'geography', difficulty: 'easy' },
      { text: 'This is the largest Indian state by area', type: 'geography', difficulty: 'easy' },
      { text: 'Jaipur, its capital, is known as the Pink City', type: 'landmark', difficulty: 'medium' },
      { text: 'Home to six majestic hill forts that are UNESCO World Heritage Sites', type: 'landmark', difficulty: 'medium' },
      { text: 'The Pushkar Camel Fair is an iconic event held here', type: 'festival', difficulty: 'hard' },
      { text: 'Dal Baati Churma is the signature dish of this state', type: 'food', difficulty: 'hard' },
    ],
  },
  {
    name: 'Sikkim',
    capital: 'Gangtok',
    region: 'Northeast',
    famous_for: 'Kanchenjunga (third highest peak)',
    fun_fact: 'First fully organic state in the world',
    statehood_year: 1975,
    official_language: 'English',
    clues: [
      { text: 'Kanchenjunga, the third highest peak in the world, is visible from here', type: 'geography', difficulty: 'easy' },
      { text: 'This became the first fully organic state in the world in 2016', type: 'history', difficulty: 'easy' },
      { text: 'Rumtek Monastery is the largest monastery in this state', type: 'landmark', difficulty: 'medium' },
      { text: 'This was an independent kingdom until it merged with India in 1975', type: 'history', difficulty: 'hard' },
      { text: 'Losar and Saga Dawa are major Buddhist festivals celebrated here', type: 'festival', difficulty: 'medium' },
    ],
  },
  {
    name: 'Tamil Nadu',
    capital: 'Chennai',
    region: 'South',
    famous_for: 'Ancient Dravidian temples',
    fun_fact: 'Has the most temples of any Indian state',
    statehood_year: 1950,
    official_language: 'Tamil',
    clues: [
      { text: 'Has more ancient temples than any other Indian state', type: 'landmark', difficulty: 'easy' },
      { text: 'Bharatanatyam, the oldest classical dance form, originated here', type: 'culture', difficulty: 'easy' },
      { text: 'Marina Beach in Chennai is one of the longest urban beaches', type: 'geography', difficulty: 'medium' },
      { text: 'The Pongal harvest festival is the most important celebration here', type: 'festival', difficulty: 'medium' },
      { text: 'Chettinad cuisine from this state is famous for its spicy flavors', type: 'food', difficulty: 'hard' },
      { text: 'The Shore Temple at Mahabalipuram is a UNESCO World Heritage Site', type: 'landmark', difficulty: 'medium' },
    ],
  },
  {
    name: 'Telangana',
    capital: 'Hyderabad',
    region: 'South',
    famous_for: 'Charminar and Hyderabadi Biryani',
    fun_fact: 'Newest state carved from Andhra Pradesh in 2014',
    statehood_year: 2014,
    official_language: 'Telugu',
    clues: [
      { text: 'Hyderabad, the City of Pearls, is the capital of this state', type: 'geography', difficulty: 'easy' },
      { text: 'The Charminar, a 16th-century monument, is an iconic landmark here', type: 'landmark', difficulty: 'easy' },
      { text: 'This is the newest state in India, formed in 2014', type: 'history', difficulty: 'medium' },
      { text: 'Hyderabadi Biryani is the most famous culinary export from here', type: 'food', difficulty: 'medium' },
      { text: 'Bathukamma, a floral festival, is unique to this state', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Tripura',
    capital: 'Agartala',
    region: 'Northeast',
    famous_for: 'Ujjayanta Palace',
    fun_fact: 'Third smallest state in India',
    statehood_year: 1972,
    official_language: 'Bengali',
    clues: [
      { text: 'Ujjayanta Palace, a former royal palace, is a major attraction here', type: 'landmark', difficulty: 'easy' },
      { text: 'This is the third smallest state in India by area', type: 'geography', difficulty: 'medium' },
      { text: 'Neermahal, a water palace in the middle of a lake, is found here', type: 'landmark', difficulty: 'hard' },
      { text: 'The state shares a long border with Bangladesh on three sides', type: 'geography', difficulty: 'medium' },
      { text: 'Garia Puja is a major tribal festival celebrated here', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    region: 'North',
    famous_for: 'Taj Mahal',
    fun_fact: 'Most populous state in India',
    statehood_year: 1950,
    official_language: 'Hindi',
    clues: [
      { text: 'The Taj Mahal, one of the Seven Wonders of the World, is here', type: 'landmark', difficulty: 'easy' },
      { text: 'This is the most populous state in India', type: 'geography', difficulty: 'easy' },
      { text: 'Varanasi, one of the oldest continuously inhabited cities, is here', type: 'history', difficulty: 'medium' },
      { text: 'The Kumbh Mela, the largest religious gathering, takes place here', type: 'festival', difficulty: 'medium' },
      { text: 'Lucknawi cuisine, including Kebabs and Biryani, is famous here', type: 'food', difficulty: 'hard' },
      { text: 'Ayodhya, believed to be the birthplace of Lord Rama, is here', type: 'history', difficulty: 'medium' },
    ],
  },
  {
    name: 'Uttarakhand',
    capital: 'Dehradun',
    region: 'North',
    famous_for: 'Char Dham pilgrimage',
    fun_fact: "Known as 'Land of Gods' (Dev Bhoomi)",
    statehood_year: 2000,
    official_language: 'Hindi',
    clues: [
      { text: 'The Char Dham pilgrimage (Badrinath, Kedarnath, Gangotri, Yamunotri) is here', type: 'landmark', difficulty: 'easy' },
      { text: 'Known as "Dev Bhoomi" (Land of Gods)', type: 'culture', difficulty: 'easy' },
      { text: "Jim Corbett National Park, India's first national park, is here", type: 'wildlife', difficulty: 'medium' },
      { text: 'The Ganges and Yamuna rivers originate in this state', type: 'geography', difficulty: 'medium' },
      { text: 'Rishikesh is known as the Yoga Capital of the World', type: 'culture', difficulty: 'hard' },
      { text: 'The Valley of Flowers is a UNESCO World Heritage Site here', type: 'geography', difficulty: 'hard' },
    ],
  },
  {
    name: 'West Bengal',
    capital: 'Kolkata',
    region: 'East',
    famous_for: 'Victoria Memorial and Durga Puja',
    fun_fact: 'Home to the Sundarbans, largest mangrove forest',
    statehood_year: 1950,
    official_language: 'Bengali',
    clues: [
      { text: 'Durga Puja, the grandest festival in eastern India, is celebrated here', type: 'festival', difficulty: 'easy' },
      { text: 'The Victoria Memorial in Kolkata is a grand marble building', type: 'landmark', difficulty: 'easy' },
      { text: 'Home to the Sundarbans, the largest mangrove forest in the world', type: 'geography', difficulty: 'medium' },
      { text: 'Darjeeling tea from this state is known as the "Champagne of Teas"', type: 'food', difficulty: 'medium' },
      { text: "Rabindranath Tagore, Asia's first Nobel laureate, was from here", type: 'history', difficulty: 'hard' },
      { text: 'The Howrah Bridge is an iconic cantilever bridge in this state', type: 'landmark', difficulty: 'medium' },
    ],
  },

  // ─────────────────────────────────────────
  // UNION TERRITORIES (8)
  // ─────────────────────────────────────────
  {
    name: 'Andaman & Nicobar Islands',
    capital: 'Port Blair',
    region: 'Islands',
    famous_for: 'Cellular Jail and pristine beaches',
    fun_fact: 'Home to some of the most isolated tribes in the world',
    statehood_year: 1956,
    official_language: 'Hindi',
    clues: [
      { text: 'Cellular Jail in Port Blair is a historic colonial prison here', type: 'landmark', difficulty: 'easy' },
      { text: 'This UT is home to some of the most isolated indigenous tribes', type: 'culture', difficulty: 'medium' },
      { text: "Radhanagar Beach is consistently rated as one of Asia's best beaches", type: 'geography', difficulty: 'medium' },
      { text: 'Located in the Bay of Bengal, about 1,400 km from mainland India', type: 'geography', difficulty: 'hard' },
      { text: 'The Jarawa and Sentinelese tribes live in protected areas here', type: 'culture', difficulty: 'hard' },
    ],
  },
  {
    name: 'Chandigarh',
    capital: 'Chandigarh',
    region: 'North',
    famous_for: 'Rock Garden and planned city',
    fun_fact: 'Only planned city in India designed by Le Corbusier',
    statehood_year: 1966,
    official_language: 'English',
    clues: [
      { text: 'This is the only planned city in India designed by Le Corbusier', type: 'history', difficulty: 'easy' },
      { text: 'The Rock Garden, made entirely from industrial and urban waste, is here', type: 'landmark', difficulty: 'easy' },
      { text: 'This UT serves as the shared capital of Punjab and Haryana', type: 'geography', difficulty: 'medium' },
      { text: 'Sukhna Lake, a man-made reservoir at the foothills of Shivalik, is here', type: 'geography', difficulty: 'hard' },
      { text: 'Known for its well-organized sector-based city layout', type: 'culture', difficulty: 'medium' },
    ],
  },
  {
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    capital: 'Daman',
    region: 'West',
    famous_for: 'Portuguese colonial architecture',
    fun_fact: 'Merged from two separate UTs in 2020',
    statehood_year: 2020,
    official_language: 'Gujarati',
    clues: [
      { text: 'This UT was formed by merging two separate territories in 2020', type: 'history', difficulty: 'easy' },
      { text: 'Features Portuguese colonial architecture from centuries of Portuguese rule', type: 'culture', difficulty: 'medium' },
      { text: 'Daman is known for its Fort of Moti Daman and churches', type: 'landmark', difficulty: 'medium' },
      { text: 'Located on the western coast, bordering Gujarat and Maharashtra', type: 'geography', difficulty: 'hard' },
      { text: 'The Nani Daman Fort dates back to the 16th century', type: 'landmark', difficulty: 'hard' },
    ],
  },
  {
    name: 'Delhi',
    capital: 'New Delhi',
    region: 'North',
    famous_for: 'Red Fort and India Gate',
    fun_fact: 'Serves as the national capital territory',
    statehood_year: 1956,
    official_language: 'Hindi',
    clues: [
      { text: "The Red Fort, where India's Independence Day flag hoisting takes place, is here", type: 'landmark', difficulty: 'easy' },
      { text: 'India Gate, a war memorial, is one of the most iconic landmarks here', type: 'landmark', difficulty: 'easy' },
      { text: 'Qutub Minar, the tallest brick minaret in the world, is here', type: 'landmark', difficulty: 'medium' },
      { text: 'This territory has been the capital of multiple empires throughout history', type: 'history', difficulty: 'medium' },
      { text: 'Chandni Chowk is one of the oldest and busiest markets in India', type: 'culture', difficulty: 'hard' },
      { text: 'Paranthe Wali Gali is famous for its stuffed paranthas', type: 'food', difficulty: 'hard' },
    ],
  },
  {
    name: 'Jammu & Kashmir',
    capital: 'Srinagar (summer)/Jammu (winter)',
    region: 'North',
    famous_for: 'Dal Lake and houseboats',
    fun_fact: "Known as 'Paradise on Earth'",
    statehood_year: 2019,
    official_language: 'Urdu',
    clues: [
      { text: 'Known as "Paradise on Earth" for its stunning natural beauty', type: 'geography', difficulty: 'easy' },
      { text: 'Dal Lake with its iconic houseboats and shikaras is located here', type: 'landmark', difficulty: 'easy' },
      { text: 'This territory has two capitals: Srinagar (summer) and Jammu (winter)', type: 'geography', difficulty: 'medium' },
      { text: 'Pashmina shawls, the finest wool products, originate from here', type: 'culture', difficulty: 'hard' },
      { text: 'The Vaishno Devi temple is one of the most visited shrines here', type: 'landmark', difficulty: 'medium' },
    ],
  },
  {
    name: 'Ladakh',
    capital: 'Leh',
    region: 'North',
    famous_for: 'Pangong Lake and monasteries',
    fun_fact: 'Highest plateau region in India',
    statehood_year: 2019,
    official_language: 'Ladakhi',
    clues: [
      { text: 'Pangong Tso, a stunning high-altitude lake, is located here', type: 'geography', difficulty: 'easy' },
      { text: 'This is the highest plateau region in India', type: 'geography', difficulty: 'medium' },
      { text: 'Ancient Buddhist monasteries dot the landscape here', type: 'culture', difficulty: 'medium' },
      { text: 'The Magnetic Hill near Leh creates an optical illusion of defying gravity', type: 'landmark', difficulty: 'hard' },
      { text: 'Hemis Festival celebrating Guru Padmasambhava is held here', type: 'festival', difficulty: 'hard' },
    ],
  },
  {
    name: 'Lakshadweep',
    capital: 'Kavaratti',
    region: 'Islands',
    famous_for: 'Coral atolls and lagoons',
    fun_fact: 'Smallest Union Territory by area',
    statehood_year: 1956,
    official_language: 'Malayalam',
    clues: [
      { text: 'This is the smallest Union Territory in India by area', type: 'geography', difficulty: 'easy' },
      { text: 'Comprised of 36 coral atolls and reef islands', type: 'geography', difficulty: 'medium' },
      { text: 'Only 10 of the 36 islands are inhabited', type: 'geography', difficulty: 'hard' },
      { text: 'Known for pristine lagoons and water sports like snorkeling and kayaking', type: 'culture', difficulty: 'medium' },
      { text: 'Located about 200-400 km off the coast of Kerala', type: 'geography', difficulty: 'hard' },
    ],
  },
  {
    name: 'Puducherry',
    capital: 'Puducherry',
    region: 'South',
    famous_for: 'French Quarter and Auroville',
    fun_fact: 'Former French colony with distinct Franco-Tamil culture',
    statehood_year: 1954,
    official_language: 'Tamil',
    clues: [
      { text: 'This was a former French colony with distinct Franco-Tamil culture', type: 'history', difficulty: 'easy' },
      { text: 'Auroville, an experimental international township, is located here', type: 'landmark', difficulty: 'medium' },
      { text: 'The French Quarter with its colonial-era buildings is a major attraction', type: 'culture', difficulty: 'medium' },
      { text: 'Sri Aurobindo Ashram is a famous spiritual center here', type: 'landmark', difficulty: 'hard' },
      { text: 'Promenade Beach along the Bay of Bengal is iconic here', type: 'geography', difficulty: 'easy' },
    ],
  },
];

// ──────────────────────────────────────────────
// Seed execution
// ──────────────────────────────────────────────

/**
 * Seeds the database with all states and clues in a single transaction.
 * Clears existing data before inserting.
 */
function seed() {
  console.log('🌱 Starting database seed...\n');

  const insertState = db.prepare(`
    INSERT INTO states (name, capital, region, famous_for, fun_fact, statehood_year, official_language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertClue = db.prepare(`
    INSERT INTO clues (state_id, clue_text, clue_type, difficulty)
    VALUES (?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    // Clear existing data
    db.exec('DELETE FROM clues');
    db.exec('DELETE FROM states');

    let totalClues = 0;
    const clueTypeCounts = {};
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };

    for (const state of statesData) {
      const result = insertState.run(
        state.name,
        state.capital,
        state.region,
        state.famous_for,
        state.fun_fact,
        state.statehood_year,
        state.official_language
      );

      const stateId = result.lastInsertRowid;

      for (const clue of state.clues) {
        insertClue.run(stateId, clue.text, clue.type, clue.difficulty);
        totalClues++;

        // Track stats
        clueTypeCounts[clue.type] = (clueTypeCounts[clue.type] || 0) + 1;
        difficultyCounts[clue.difficulty]++;
      }
    }

    db.exec('COMMIT');
    const stats = { totalClues, clueTypeCounts, difficultyCounts };

    console.log('✅ Database seeded successfully!\n');
    console.log('📊 Seed Statistics:');
    console.log(`   Total States/UTs: ${statesData.length}`);
    console.log(`   Total Clues:      ${stats.totalClues}`);
    console.log('');
    console.log('   Clues by Type:');
    for (const [type, count] of Object.entries(stats.clueTypeCounts).sort()) {
      console.log(`     ${type.padEnd(12)} ${count}`);
    }
    console.log('');
    console.log('   Clues by Difficulty:');
    for (const [diff, count] of Object.entries(stats.difficultyCounts)) {
      console.log(`     ${diff.padEnd(12)} ${count}`);
    }
    console.log('');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed();
  db.close();
}

module.exports = { seed };
