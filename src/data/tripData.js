export const cities = [
  { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', days: 3, color: '#3b82f6' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', days: 2, color: '#8b5cf6' },
  { id: 'brussels', name: 'Brussels', country: 'Belgium', flag: '🇧🇪', days: 2, color: '#f59e0b' },
  { id: 'bruges', name: 'Bruges', country: 'Belgium', flag: '🇧🇪', days: 1, color: '#f59e0b' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', flag: '🇩🇪', days: 3, color: '#10b981' },
  { id: 'munich', name: 'Munich', country: 'Germany', flag: '🇩🇪', days: 2, color: '#10b981' },
  { id: 'budapest', name: 'Budapest', country: 'Hungary', flag: '🇭🇺', days: 3, color: '#ef4444' },
]

export const places = {
  paris: [
    { id: 'p1', name: 'Eiffel Tower', type: 'Landmark', rating: 4.7, reviews: '285K', duration: '2-3h', kidFriendly: true, mustSee: true, lat: 48.8584, lng: 2.2945, desc: 'Iconic iron lattice tower with panoramic city views. Book tickets in advance.', mapUrl: 'https://maps.google.com/?q=Eiffel+Tower+Paris', tip: 'Go at sunset for magical light. Kids love the 1st floor glass floor.' },
    { id: 'p2', name: 'Louvre Museum', type: 'Museum', rating: 4.7, reviews: '260K', duration: '3-4h', kidFriendly: true, mustSee: true, lat: 48.8606, lng: 2.3376, desc: 'World\'s largest art museum. Home to the Mona Lisa & Venus de Milo.', mapUrl: 'https://maps.google.com/?q=Louvre+Museum+Paris', tip: 'Book skip-the-line tickets. Wednesday & Friday open until 9:45pm.' },
    { id: 'p3', name: 'Notre-Dame Cathedral', type: 'Church', rating: 4.7, reviews: '178K', duration: '1-2h', kidFriendly: true, mustSee: true, lat: 48.8530, lng: 2.3499, desc: 'Gothic masterpiece reopened in 2024 after fire restoration.', mapUrl: 'https://maps.google.com/?q=Notre-Dame+Cathedral+Paris', tip: 'Free entry. Exterior view from Île de la Cité is stunning.' },
    { id: 'p4', name: 'Palace of Versailles', type: 'Palace', rating: 4.6, reviews: '142K', duration: '4-5h', kidFriendly: true, mustSee: true, lat: 48.8049, lng: 2.1204, desc: 'Opulent royal palace with spectacular gardens. Day trip from Paris.', mapUrl: 'https://maps.google.com/?q=Palace+of+Versailles', tip: 'Take RER C from Paris. Arrive early — very crowded in July.' },
    { id: 'p5', name: 'Musée d\'Orsay', type: 'Museum', rating: 4.7, reviews: '95K', duration: '2-3h', kidFriendly: true, mustSee: false, lat: 48.8600, lng: 2.3266, desc: 'Impressionist masterpieces by Monet, Renoir, Van Gogh in a gorgeous train station.', mapUrl: 'https://maps.google.com/?q=Musee+d+Orsay+Paris', tip: 'Thursday open late. Less crowded than the Louvre.' },
    { id: 'p6', name: 'Sacré-Cœur & Montmartre', type: 'Landmark', rating: 4.6, reviews: '87K', duration: '2h', kidFriendly: true, mustSee: true, lat: 48.8867, lng: 2.3431, desc: 'White-domed basilica with best free city views. Charming artist quarter.', mapUrl: 'https://maps.google.com/?q=Sacre+Coeur+Montmartre+Paris', tip: 'Take the funicular with kids. Early morning beats the crowds.' },
    { id: 'p7', name: 'Seine River Cruise', type: 'Activity', rating: 4.5, reviews: '68K', duration: '1h', kidFriendly: true, mustSee: true, lat: 48.8616, lng: 2.3122, desc: 'See Paris landmarks from the water. Bateaux Mouches & Vedettes du Pont Neuf.', mapUrl: 'https://maps.google.com/?q=Bateaux+Mouches+Paris', tip: 'Evening cruises are magical. Kids under 4 free on most lines.' },
    { id: 'p8', name: 'Disneyland Paris', type: 'Theme Park', rating: 4.4, reviews: '112K', duration: 'Full day', kidFriendly: true, mustSee: false, lat: 48.8722, lng: 2.7760, desc: '2 parks — Disneyland & Walt Disney Studios. 45 min from Paris by RER A.', mapUrl: 'https://maps.google.com/?q=Disneyland+Paris', tip: 'Buy tickets online. July is busy — arrive at opening.' },
  ],
  amsterdam: [
    { id: 'a1', name: 'Anne Frank House', type: 'Museum', rating: 4.6, reviews: '82K', duration: '1-2h', kidFriendly: false, mustSee: true, lat: 52.3752, lng: 4.8840, desc: 'Historic hiding place during WWII. Deeply moving museum.', mapUrl: 'https://maps.google.com/?q=Anne+Frank+House+Amsterdam', tip: 'Book tickets months in advance — sells out fast. Best for older kids.' },
    { id: 'a2', name: 'Rijksmuseum', type: 'Museum', rating: 4.8, reviews: '76K', duration: '3h', kidFriendly: true, mustSee: true, lat: 52.3600, lng: 4.8852, desc: 'Dutch masterpieces — Rembrandt, Vermeer. Stunning building & gardens.', mapUrl: 'https://maps.google.com/?q=Rijksmuseum+Amsterdam', tip: 'Free family audio guides for kids. Don\'t miss The Night Watch.' },
    { id: 'a3', name: 'Canal Ring Boat Tour', type: 'Activity', rating: 4.5, reviews: '54K', duration: '1h', kidFriendly: true, mustSee: true, lat: 52.3676, lng: 4.9041, desc: 'UNESCO-listed canals seen from a boat. Best way to see the city.', mapUrl: 'https://maps.google.com/?q=Amsterdam+Canal+Cruise', tip: 'Open boats are fun in summer. Kids love spotting houseboats.' },
    { id: 'a4', name: 'Keukenhof Gardens', type: 'Park', rating: 4.7, reviews: '41K', duration: '3h', kidFriendly: true, mustSee: false, lat: 52.2697, lng: 4.5462, desc: 'World\'s largest flower garden. NOTE: Closes mid-May — not open in July.', mapUrl: 'https://maps.google.com/?q=Keukenhof+Gardens', tip: 'Closed in July. Visit Hortus Botanicus instead.' },
    { id: 'a5', name: 'NEMO Science Museum', type: 'Museum', rating: 4.4, reviews: '32K', duration: '3h', kidFriendly: true, mustSee: true, lat: 52.3738, lng: 4.9123, desc: 'Hands-on science museum — perfect for kids. Rooftop terrace with city views.', mapUrl: 'https://maps.google.com/?q=NEMO+Science+Museum+Amsterdam', tip: 'Kids love the interactive exhibits. Roof terrace is free.' },
    { id: 'a6', name: 'Vondelpark', type: 'Park', rating: 4.6, reviews: '45K', duration: '1-2h', kidFriendly: true, mustSee: false, lat: 52.3579, lng: 4.8686, desc: 'Amsterdam\'s central park. Playgrounds, ponds, open-air theatre in summer.', mapUrl: 'https://maps.google.com/?q=Vondelpark+Amsterdam', tip: 'Free outdoor concerts in July. Great for a picnic break.' },
  ],
  brussels: [
    { id: 'br1', name: 'Grand Place', type: 'Landmark', rating: 4.8, reviews: '92K', duration: '1h', kidFriendly: true, mustSee: true, lat: 50.8467, lng: 4.3525, desc: 'UNESCO World Heritage stunning medieval square. One of Europe\'s most beautiful.', mapUrl: 'https://maps.google.com/?q=Grand+Place+Brussels', tip: 'Most beautiful at night when lit up. Flower carpet every 2 years.' },
    { id: 'br2', name: 'Atomium', type: 'Landmark', rating: 4.4, reviews: '58K', duration: '2h', kidFriendly: true, mustSee: true, lat: 50.8947, lng: 4.3413, desc: 'Iconic 102m steel structure from 1958 World Expo. Panoramic views.', mapUrl: 'https://maps.google.com/?q=Atomium+Brussels', tip: 'Book online. Mini-Europe park next door is great for kids.' },
    { id: 'br3', name: 'Belgian Comic Strip Center', type: 'Museum', rating: 4.4, reviews: '22K', duration: '2h', kidFriendly: true, mustSee: false, lat: 50.8524, lng: 4.3576, desc: 'Tintin, Smurfs & more. Belgium is the home of comics.', mapUrl: 'https://maps.google.com/?q=Belgian+Comic+Strip+Center+Brussels', tip: 'Kids love it. Pick up a comic strip walking map of the city.' },
    { id: 'br4', name: 'Manneken Pis', type: 'Landmark', rating: 3.8, reviews: '48K', duration: '15min', kidFriendly: true, mustSee: true, lat: 50.8450, lng: 4.3498, desc: 'Tiny famous statue. Often dressed in costumes. Smaller than expected!', mapUrl: 'https://maps.google.com/?q=Manneken+Pis+Brussels', tip: 'Combine with Grand Place walk. Check what costume he\'s wearing.' },
    { id: 'br5', name: 'Royal Museums of Fine Arts', type: 'Museum', rating: 4.5, reviews: '28K', duration: '2-3h', kidFriendly: false, mustSee: false, lat: 50.8428, lng: 4.3610, desc: 'Flemish masterpieces from Bruegel to Magritte. Free on first Wednesday afternoon.', mapUrl: 'https://maps.google.com/?q=Royal+Museums+Fine+Arts+Brussels', tip: 'Free Wednesday afternoon 1pm-5pm. Best for art lovers.' },
  ],
  bruges: [
    { id: 'bg1', name: 'Bruges Historic Centre', type: 'Landmark', rating: 4.8, reviews: '65K', duration: 'Half day', kidFriendly: true, mustSee: true, lat: 51.2093, lng: 3.2247, desc: 'UNESCO medieval city — canals, cobblestones, chocolate shops. Like a fairy tale.', mapUrl: 'https://maps.google.com/?q=Bruges+Historic+Centre', tip: 'Walk everywhere. Belfry tower climb has 366 steps — kids love the challenge.' },
    { id: 'bg2', name: 'Bruges Canal Boat Tour', type: 'Activity', rating: 4.6, reviews: '28K', duration: '30min', kidFriendly: true, mustSee: true, lat: 51.2070, lng: 3.2265, desc: 'See medieval buildings reflected in canals. Quintessential Bruges experience.', mapUrl: 'https://maps.google.com/?q=Bruges+Canal+Boat', tip: 'Depart from Rozenhoedkaai. Queues in summer — go early.' },
    { id: 'bg3', name: 'Choco-Story Chocolate Museum', type: 'Museum', rating: 4.3, reviews: '18K', duration: '1h', kidFriendly: true, mustSee: false, lat: 51.2110, lng: 3.2219, desc: 'History of Belgian chocolate with tasting included. Kids\' favourite.', mapUrl: 'https://maps.google.com/?q=Choco+Story+Bruges', tip: 'Includes chocolate demo and tasting. Great for kids.' },
  ],
  berlin: [
    { id: 'be1', name: 'Brandenburg Gate', type: 'Landmark', rating: 4.7, reviews: '116K', duration: '30min', kidFriendly: true, mustSee: true, lat: 52.5163, lng: 13.3777, desc: 'Symbol of German reunification. Iconic neoclassical gate in the city center.', mapUrl: 'https://maps.google.com/?q=Brandenburg+Gate+Berlin', tip: 'Free. Great at night. Combine with Holocaust Memorial nearby.' },
    { id: 'be2', name: 'Holocaust Memorial', type: 'Memorial', rating: 4.7, reviews: '72K', duration: '1h', kidFriendly: true, mustSee: true, lat: 52.5138, lng: 13.3785, desc: '2,711 concrete slabs. Haunting & thought-provoking. Underground information centre.', mapUrl: 'https://maps.google.com/?q=Holocaust+Memorial+Berlin', tip: 'Free. Underground centre recommended for older kids. Very moving.' },
    { id: 'be3', name: 'Berlin Wall Memorial', type: 'Memorial', rating: 4.6, reviews: '54K', duration: '1-2h', kidFriendly: true, mustSee: true, lat: 52.5352, lng: 13.3882, desc: 'Preserved section of the Berlin Wall with documentation centre.', mapUrl: 'https://maps.google.com/?q=Berlin+Wall+Memorial', tip: 'Free. East Side Gallery also has 1.3km of wall murals — very photogenic.' },
    { id: 'be4', name: 'Museum Island', type: 'Museum', rating: 4.7, reviews: '48K', duration: '3-4h', kidFriendly: true, mustSee: true, lat: 52.5170, lng: 13.4010, desc: 'UNESCO island with 5 world-class museums. Pergamon, Neues Museum (Nefertiti bust).', mapUrl: 'https://maps.google.com/?q=Museum+Island+Berlin', tip: 'Day pass covers all 5 museums. Book Pergamon ahead — most popular.' },
    { id: 'be5', name: 'Legoland Discovery Centre', type: 'Theme Park', rating: 4.2, reviews: '18K', duration: '3h', kidFriendly: true, mustSee: false, lat: 52.5060, lng: 13.3396, desc: 'Indoor Lego attraction — 4D cinema, rides, Miniland Berlin. Perfect for young kids.', mapUrl: 'https://maps.google.com/?q=Legoland+Discovery+Centre+Berlin', tip: 'Great rainy day option. Book online for discount.' },
    { id: 'be6', name: 'Tiergarten Park & Zoo', type: 'Park', rating: 4.6, reviews: '62K', duration: '3-4h', kidFriendly: true, mustSee: false, lat: 52.5079, lng: 13.3370, desc: 'One of Europe\'s oldest zoos. 20,000 animals. Giant panda & polar bears.', mapUrl: 'https://maps.google.com/?q=Berlin+Zoo', tip: 'Combined zoo & aquarium ticket available. Kids love the panda house.' },
  ],
  munich: [
    { id: 'm1', name: 'Marienplatz & Glockenspiel', type: 'Landmark', rating: 4.6, reviews: '78K', duration: '1h', kidFriendly: true, mustSee: true, lat: 48.1374, lng: 11.5755, desc: 'Munich\'s central square. Glockenspiel chimes daily at 11am & noon (and 5pm in summer).', mapUrl: 'https://maps.google.com/?q=Marienplatz+Munich', tip: 'Free. Be there at 11am for the Glockenspiel show. Kids love it.' },
    { id: 'm2', name: 'Deutsches Museum', type: 'Museum', rating: 4.6, reviews: '52K', duration: '3-4h', kidFriendly: true, mustSee: true, lat: 48.1300, lng: 11.5832, desc: 'World\'s largest science & technology museum. 73,000 exhibits, real planes & submarines.', mapUrl: 'https://maps.google.com/?q=Deutsches+Museum+Munich', tip: 'Kids go free under 6. Allow a full day — it\'s enormous.' },
    { id: 'm3', name: 'English Garden', type: 'Park', rating: 4.7, reviews: '55K', duration: '2h', kidFriendly: true, mustSee: true, lat: 48.1642, lng: 11.6050, desc: 'Bigger than Central Park. River surfers, beer gardens, Chinese Tower playground.', mapUrl: 'https://maps.google.com/?q=English+Garden+Munich', tip: 'Watch surfers at Eisbach. Beer gardens serve non-alcoholic drinks & pretzels for kids.' },
    { id: 'm4', name: 'Neuschwanstein Castle', type: 'Castle', rating: 4.7, reviews: '95K', duration: 'Full day', kidFriendly: true, mustSee: true, lat: 47.5576, lng: 10.7498, desc: 'The fairy-tale castle that inspired Disney. 2hr drive or train from Munich.', mapUrl: 'https://maps.google.com/?q=Neuschwanstein+Castle', tip: 'Book tickets weeks ahead. Combine with Hohenschwangau Castle nearby.' },
  ],
  budapest: [
    { id: 'bu1', name: 'Buda Castle & Castle Hill', type: 'Landmark', rating: 4.7, reviews: '68K', duration: '3h', kidFriendly: true, mustSee: true, lat: 47.4969, lng: 19.0399, desc: 'UNESCO hilltop complex with palace, cobbled streets & panoramic Danube views.', mapUrl: 'https://maps.google.com/?q=Buda+Castle+Budapest', tip: 'Take the funicular or walk up. Fisherman\'s Bastion for best views.' },
    { id: 'bu2', name: 'Parliament Building', type: 'Landmark', rating: 4.8, reviews: '74K', duration: '1h', kidFriendly: true, mustSee: true, lat: 47.5071, lng: 19.0449, desc: 'One of Europe\'s most beautiful buildings. Guided tours show crown jewels.', mapUrl: 'https://maps.google.com/?q=Hungarian+Parliament+Budapest', tip: 'Book guided tours online. Best photographed from across the Danube at sunset.' },
    { id: 'bu3', name: 'Széchenyi Thermal Baths', type: 'Activity', rating: 4.6, reviews: '58K', duration: '3h', kidFriendly: true, mustSee: true, lat: 47.5188, lng: 19.0803, desc: 'Grand 1913 neo-baroque thermal spa. Outdoor pools, indoor pools, saunas.', mapUrl: 'https://maps.google.com/?q=Szechenyi+Thermal+Bath+Budapest', tip: 'Book online. Kids love the outdoor pools. Go in the morning to avoid crowds.' },
    { id: 'bu4', name: 'Danube River Cruise', type: 'Activity', rating: 4.6, reviews: '42K', duration: '1h', kidFriendly: true, mustSee: true, lat: 47.5002, lng: 19.0471, desc: 'See Parliament, Chain Bridge, Buda Castle from the river. Evening cruises stunning.', mapUrl: 'https://maps.google.com/?q=Budapest+River+Cruise', tip: 'Evening lit-up cruise is magical. Many operators depart from Vigadó square.' },
    { id: 'bu5', name: 'Great Market Hall', type: 'Market', rating: 4.5, reviews: '36K', duration: '1h', kidFriendly: true, mustSee: true, lat: 47.4875, lng: 19.0561, desc: 'Budapest\'s largest market. Local produce, paprika, folk art, street food upstairs.', mapUrl: 'https://maps.google.com/?q=Great+Market+Hall+Budapest', tip: 'Try langos (fried dough) upstairs. Great place to buy paprika to take home.' },
    { id: 'bu6', name: 'Palvolgyi Caves', type: 'Nature', rating: 4.5, reviews: '12K', duration: '1.5h', kidFriendly: true, mustSee: false, lat: 47.5491, lng: 18.9793, desc: 'Guided cave tour — dramatic stalactites & stalagmites. Unique Budapest experience.', mapUrl: 'https://maps.google.com/?q=Palvolgyi+Caves+Budapest', tip: 'Bring a jacket — 11°C inside. Kids 5+ allowed. Great break from city heat.' },
  ],
}

export const restaurants = {
  paris: [
    { id: 'pr1', name: 'Café de Flore', type: 'Café / French', rating: 4.2, price: '€€€', area: 'Saint-Germain', desc: 'Historic literary café — Sartre\'s favourite. Perfect for breakfast or lunch.', kidFriendly: true, tip: 'Great for croissants & hot chocolate. Touristy but iconic.' },
    { id: 'pr2', name: 'Breizh Café', type: 'Crêperie', rating: 4.5, price: '€€', area: 'Marais', desc: 'Best crêpes in Paris. Buckwheat galettes & sweet crêpes. Kids go crazy for this.', kidFriendly: true, tip: 'Queue expected but worth it. Get the salted caramel crêpe.' },
    { id: 'pr3', name: 'Les Deux Magots', type: 'Café / Brasserie', rating: 4.2, price: '€€€', area: 'Saint-Germain', desc: 'Legendary café, Hemingway haunt. Good food, iconic Paris ambience.', kidFriendly: true, tip: 'Better for coffee & snacks than a full meal.' },
    { id: 'pr4', name: 'Bouillon Chartier', type: 'Traditional French', rating: 4.3, price: '€', area: 'Grands Boulevards', desc: 'Iconic 1896 restaurant with traditional French food at budget prices. Always busy.', kidFriendly: true, tip: 'Arrive when doors open. Menu written on paper. Try the onion soup.' },
    { id: 'pr5', name: 'Ladurée', type: 'Patisserie', rating: 4.4, price: '€€€', area: 'Champs-Élysées', desc: 'World-famous macarons. Opulent tearoom. A must for the sweet tooth.', kidFriendly: true, tip: 'Get a macaron box to take away — cheaper than eating in.' },
  ],
  amsterdam: [
    { id: 'ar1', name: 'Foodhallen', type: 'Food Hall', rating: 4.3, price: '€€', area: 'West Amsterdam', desc: 'Indoor food market with 20+ stalls — Dutch bitterballen, sushi, burgers. Perfect for families.', kidFriendly: true, tip: 'Everyone can pick something different. Great evening option.' },
    { id: 'ar2', name: 'Pancakes Amsterdam', type: 'Dutch', rating: 4.4, price: '€€', area: 'Canal Belt', desc: 'Dutch pancakes (pannenkoeken) — sweet & savoury, huge portions. Kids absolutely love it.', kidFriendly: true, tip: 'Multiple locations. The Amstel location has canal views.' },
    { id: 'ar3', name: 'Van Dobben', type: 'Dutch Deli', rating: 4.4, price: '€', area: 'City Centre', desc: 'Historic Amsterdam deli since 1945. Croquettes, sandwiches. Authentic & cheap.', kidFriendly: true, tip: 'Standing counter & tables. Try the kroket broodje.' },
  ],
  brussels: [
    { id: 'brr1', name: 'Chez Léon', type: 'Belgian', rating: 4.2, price: '€€', area: 'Grand Place area', desc: 'Famous since 1893 for moules-frites (mussels & fries). Most famous restaurant in Brussels.', kidFriendly: true, tip: 'Kids menu available. Busy but moves quickly. Try the waffles for dessert.' },
    { id: 'brr2', name: 'Maison Antoine', type: 'Frites / Street Food', rating: 4.6, price: '€', area: 'Ixelles', desc: 'Best frites in Brussels since 1948. Legendary street frites with 20+ sauces.', kidFriendly: true, tip: 'Queue is normal. Order with andalouse sauce. Eat in nearby Flagey square.' },
    { id: 'brr3', name: 'Waffles de Liège stands', type: 'Street Food', rating: 4.7, price: '€', area: 'City Wide', desc: 'Belgian waffles — pearl sugar Liège style, warm & caramelised. Street stands everywhere.', kidFriendly: true, tip: 'Look for fresh-made stands near Grand Place. Avoid tourist trap waffle shops.' },
  ],
  bruges: [
    { id: 'bgr1', name: 'De Vlaamsche Pot', type: 'Belgian', rating: 4.5, price: '€€€', area: 'City Centre', desc: 'Traditional Flemish cuisine — stew, stoofvlees, waterzooi. Cosy & authentic.', kidFriendly: true, tip: 'Book ahead. Try the Belgian beef stew with fries. Kids menu available.' },
    { id: 'bgr2', name: 'The Chocolate Line', type: 'Chocolate Shop', rating: 4.6, price: '€€', area: 'Simon Stevinplein', desc: 'Award-winning artisan chocolatier by Dominique Persoone. Unique flavour combinations.', kidFriendly: true, tip: 'Watch chocolates being made. Buy a tasting box — extraordinary quality.' },
  ],
  berlin: [
    { id: 'ber1', name: 'Mustafa\'s Gemüse Kebap', type: 'Street Food / Turkish', rating: 4.6, price: '€', area: 'Kreuzberg', desc: 'Berlin\'s most famous döner kebab. Vegetable döner with roasted veg & feta. Always a queue.', kidFriendly: true, tip: 'Queue 30-45 min but absolutely worth it. Kids can have a half portion.' },
    { id: 'ber2', name: 'Markthalle Neun', type: 'Food Market', rating: 4.5, price: '€€', area: 'Kreuzberg', desc: 'Historic covered market. Thursday Street Food Thursday evenings are famous.', kidFriendly: true, tip: 'Thursday 5-10pm street food market is unmissable. Diverse global food.' },
    { id: 'ber3', name: 'Café Einstein Stammhaus', type: 'Viennese Café', rating: 4.3, price: '€€€', area: 'Tiergarten', desc: 'Elegant 1920s Vienna-style coffeehouse. Schnitzel, cakes, excellent coffee.', kidFriendly: true, tip: 'Good for a leisurely breakfast or afternoon coffee & cake.' },
    { id: 'ber4', name: 'Curry 36', type: 'Street Food', rating: 4.4, price: '€', area: 'Mehringdamm', desc: 'Berlin\'s iconic currywurst since 1981. Essential Berlin street food experience.', kidFriendly: true, tip: 'Currywurst with fries is a Berlin institution. Kids love it. Very cheap.' },
  ],
  munich: [
    { id: 'mr1', name: 'Hofbräuhaus', type: 'Beer Hall / Bavarian', rating: 4.3, price: '€€', area: 'City Centre', desc: 'World\'s most famous beer hall since 1589. Bavarian food, live music, huge pretzels.', kidFriendly: true, tip: 'Kids welcome. Order Weisswurst, pretzels & Obatzda (cheese dip). Very touristy but unmissable.' },
    { id: 'mr2', name: 'Viktualienmarkt', type: 'Market / Food', rating: 4.6, price: '€', area: 'City Centre', desc: 'Munich\'s daily food market. Sausages, cheese, bread, fruit. Outdoor beer garden inside.', kidFriendly: true, tip: 'Perfect for a lunch picnic. Try Weisswurst before noon — Bavarian tradition.' },
    { id: 'mr3', name: 'Augustiner Keller', type: 'Beer Garden / Bavarian', rating: 4.5, price: '€€', area: 'Neuhausen', desc: 'Legendary beer garden under chestnut trees. 5,000 seats. Locals\' favourite over Hofbräuhaus.', kidFriendly: true, tip: 'Family section with playground. Kids\' non-alcoholic drinks & food available.' },
  ],
  budapest: [
    { id: 'bur1', name: 'Gerbeaud', type: 'Café / Patisserie', rating: 4.3, price: '€€€', area: 'Vörösmarty Square', desc: 'Budapest\'s most famous café since 1858. Stunning interior, cakes & hot chocolate.', kidFriendly: true, tip: 'Pricey but worth it for the ambience. Get the Dobos torte (layered caramel cake).' },
    { id: 'bur2', name: 'Kárpátia Restaurant', type: 'Hungarian', rating: 4.5, price: '€€€', area: 'City Centre', desc: 'Classic Hungarian cuisine — goulash, paprikash, langos — in a beautiful historic room.', kidFriendly: true, tip: 'Try goulash & chicken paprikash. The interior is stunning — very photogenic.' },
    { id: 'bur3', name: 'Bors Gastro Bar', type: 'Street Food / Sandwiches', rating: 4.7, price: '€', area: 'Kazinczy Street', desc: 'Tiny legendary spot with inventive soups & sandwiches. Cult following. Always a queue.', kidFriendly: false, tip: 'Tiny space. Takeaway only — eat outside. Try the daily soup. Lunch only.' },
    { id: 'bur4', name: 'Langos stands (Market Hall)', type: 'Street Food', rating: 4.6, price: '€', area: 'Great Market Hall', desc: 'Fried dough with sour cream & cheese. Hungary\'s ultimate street food. Best at market.', kidFriendly: true, tip: 'Go to Great Market Hall upper floor. Kids absolutely love langos.' },
  ],
}

export const hotels = {
  paris: [
    { id: 'ph1', name: 'citizenM Paris Gare de Lyon', stars: 4, rating: 4.6, price: '€€', area: 'Gare de Lyon', desc: 'Modern, stylish & affordable. Compact but smart-designed rooms. Great for families.', tip: 'Great transport links. 24/7 canteen. Book early for best rates.' },
    { id: 'ph2', name: 'Hôtel du Louvre', stars: 5, rating: 4.5, price: '€€€€', area: 'Right Bank / Louvre', desc: 'Historic luxury hotel steps from the Louvre. Opulent rooms, central location.', tip: 'Junior suites fit families well. Rooftop bar has Eiffel views.' },
    { id: 'ph3', name: 'ibis Paris Montmartre', stars: 3, rating: 4.1, price: '€', area: 'Montmartre', desc: 'Budget-friendly, clean & reliable. Good transport connections. Family rooms available.', tip: 'Charming Montmartre neighbourhood. Metro 2 takes you everywhere.' },
  ],
  amsterdam: [
    { id: 'ah1', name: 'Hotel V Nesplein', stars: 4, rating: 4.6, price: '€€€', area: 'City Centre', desc: 'Stylish boutique hotel in the historic centre. Walking distance to everything.', tip: 'Family rooms available. Excellent breakfast included.' },
    { id: 'ah2', name: 'INK Hotel Amsterdam', stars: 4, rating: 4.5, price: '€€€', area: 'Canal Belt', desc: 'Housed in a former newspaper building. Trendy rooms, great location.', tip: 'Close to Leidseplein. Connecting rooms for families.' },
  ],
  brussels: [
    { id: 'brh1', name: 'Marriott Brussels', stars: 4, rating: 4.5, price: '€€€', area: 'Grand Place', desc: 'Right next to Grand Place. Classic luxury, family rooms available.', tip: 'Unbeatable location. Ask for rooms facing Grand Place.' },
    { id: 'brh2', name: 'Hotel Bloom', stars: 4, rating: 4.4, price: '€€', area: 'City Centre', desc: 'Vibrant, art-themed boutique hotel. Modern rooms, central location. Good value.', tip: 'Great buffet breakfast. 5 min walk to Grand Place.' },
  ],
  bruges: [
    { id: 'bgh1', name: 'Hotel Heritage', stars: 4, rating: 4.7, price: '€€€', area: 'City Centre', desc: 'Elegant historic mansion within the UNESCO zone. Beautifully restored.', tip: 'Walk to everything. Outstanding breakfast. Book well in advance for July.' },
    { id: 'bgh2', name: 'Hotel Navarra', stars: 4, rating: 4.4, price: '€€', area: 'City Centre', desc: 'Former trading house with rooftop pool. Family rooms, great value.', tip: 'Rooftop pool great for kids in summer. Excellent location.' },
  ],
  berlin: [
    { id: 'beh1', name: 'Hotel Indigo Berlin Alexanderplatz', stars: 4, rating: 4.5, price: '€€', area: 'Mitte', desc: 'Stylish boutique in perfect central location. Modern rooms, walking to all sights.', tip: 'Family rooms available. Alexanderplatz metro connects everywhere.' },
    { id: 'beh2', name: 'Radisson Blu Berlin', stars: 4, rating: 4.4, price: '€€€', area: 'Museum Island', desc: 'Has a 25m AquaDom fish tank in lobby — kids go crazy! Steps from Museum Island.', tip: 'The lobby aquarium is unmissable. Great family option. Book ahead.' },
  ],
  munich: [
    { id: 'mh1', name: 'Hotel Bayerischer Hof', stars: 5, rating: 4.6, price: '€€€€', area: 'City Centre', desc: 'Munich\'s grande dame. Historic luxury, rooftop terrace, central location.', tip: 'Junior suites ideal for families. Roof terrace bar has Alps views.' },
    { id: 'mh2', name: 'Motel One München-Sendlinger Tor', stars: 3, rating: 4.5, price: '€€', area: 'Sendlinger Tor', desc: 'Excellent value, modern design hotel. Superb central location.', tip: 'Smartly designed rooms. Walking to Marienplatz. Book early.' },
  ],
  budapest: [
    { id: 'buh1', name: 'Aria Hotel Budapest', stars: 5, rating: 4.8, price: '€€€€', area: 'City Centre', desc: 'Music-themed luxury boutique. Rooftop terrace with Parliament views. Outstanding.', tip: 'Rooftop bar is spectacular. Best hotel in Budapest by many rankings.' },
    { id: 'buh2', name: 'Ibis Budapest Centro', stars: 3, rating: 4.3, price: '€', area: 'City Centre', desc: 'Good budget option, clean & reliable. Central location, all sights walkable.', tip: 'Best budget pick in the city centre. Family rooms available.' },
    { id: 'buh3', name: 'Danubius Hotel Gellért', stars: 4, rating: 4.2, price: '€€', area: 'Gellért Hill', desc: 'Art Nouveau hotel with its own thermal spa included. Historic & atmospheric.', tip: 'Thermal bath included in room rate. Unique Budapest experience for families.' },
  ],
}

export const itinerary = [
  { day: 1, city: 'paris', title: 'Arrival & Eiffel Tower', activities: ['p1', 'p7'], notes: 'Arrive, check in, evening Seine cruise & Eiffel Tower light show' },
  { day: 2, city: 'paris', title: 'Museums & Montmartre', activities: ['p2', 'p6'], notes: 'Morning Louvre (book ahead), afternoon Montmartre & Sacré-Cœur' },
  { day: 3, city: 'paris', title: 'Versailles Day Trip', activities: ['p4', 'p3'], notes: 'Full day at Versailles, evening Notre-Dame walk' },
  { day: 4, city: 'amsterdam', title: 'Canals & Science', activities: ['a3', 'a5'], notes: 'Morning canal boat tour, afternoon NEMO Science Museum' },
  { day: 5, city: 'amsterdam', title: 'Museums & Parks', activities: ['a2', 'a6'], notes: 'Rijksmuseum morning, Vondelpark picnic afternoon' },
  { day: 6, city: 'bruges', title: 'Fairy-tale Bruges', activities: ['bg1', 'bg2', 'bg3'], notes: 'Full day in medieval Bruges — canals, belfry, chocolate' },
  { day: 7, city: 'brussels', title: 'Brussels Highlights', activities: ['br1', 'br2', 'br4'], notes: 'Grand Place, Atomium, Manneken Pis' },
  { day: 8, city: 'brussels', title: 'Comics & Culture', activities: ['br3', 'br5'], notes: 'Comic Strip Centre, afternoon free time / shopping' },
  { day: 9, city: 'berlin', title: 'Berlin History', activities: ['be1', 'be2', 'be3'], notes: 'Brandenburg Gate, Holocaust Memorial, Berlin Wall' },
  { day: 10, city: 'berlin', title: 'Museums & Zoo', activities: ['be4', 'be6'], notes: 'Museum Island morning, Berlin Zoo afternoon' },
  { day: 11, city: 'berlin', title: 'Family Fun Day', activities: ['be5'], notes: 'Legoland Discovery Centre, Tiergarten walks, street food' },
  { day: 12, city: 'munich', title: 'Munich City', activities: ['m1', 'm3'], notes: 'Marienplatz & Glockenspiel, English Garden afternoon' },
  { day: 13, city: 'munich', title: 'Neuschwanstein Castle', activities: ['m4', 'm2'], notes: 'Full day fairy-tale castle trip. Book tickets way ahead!' },
  { day: 14, city: 'budapest', title: 'Budapest Panorama', activities: ['bu1', 'bu2', 'bu4'], notes: 'Buda Castle, Parliament, evening Danube cruise' },
  { day: 15, city: 'budapest', title: 'Spas & Markets', activities: ['bu3', 'bu5'], notes: 'Széchenyi Thermal Baths morning, Great Market Hall afternoon' },
  { day: 16, city: 'budapest', title: 'Caves & Departure', activities: ['bu6'], notes: 'Pálvölgyi Caves morning, afternoon departure' },
]
