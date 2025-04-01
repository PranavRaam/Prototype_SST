/**
 * Mapping of the regions to the 4 divisional groups
 */

export const regionToDivisionalGroup = {
  "West": "West",
  "Central": "Central",
  "East Central": "East Central",
  "East": "East"
};

// Map each divisional group to its regions
export const divisionalGroupToRegions = {
  "West": ["West"],
  "Central": ["Central"],
  "East Central": ["East Central"],
  "East": ["East"]
};

// Statistical Area names for each region
export const regionToStatisticalAreas = {
  "West": [
    "Anchorage, AK", "Fairbanks, AK",
    "Flagstaff, AZ", "Lake Havasu City-Kingman, AZ", "Phoenix-Mesa-Scottsdale, AZ",
    "Prescott, AZ", "Sierra Vista-Douglas, AZ", "Tucson, AZ", "Yuma, AZ",
    "Bakersfield, CA", "Chico, CA", "El Centro, CA", "Fresno, CA", "Hanford-Corcoran, CA",
    "Los Angeles-Long Beach-Anaheim, CA", "Madera, CA", "Merced, CA", "Modesto, CA",
    "Napa, CA", "Oxnard-Thousand Oaks-Ventura, CA", "Redding, CA",
    "Riverside-San Bernardino-Ontario, CA", "Sacramento--Roseville--Arden-Arcade, CA",
    "Salinas, CA", "San Diego-Carlsbad, CA", "San Francisco-Oakland-Hayward, CA",
    "San Jose-Sunnyvale-Santa Clara, CA", "San Luis Obispo-Paso Robles-Arroyo Grande, CA",
    "Santa Cruz-Watsonville, CA", "Santa Maria-Santa Barbara, CA", "Santa Rosa, CA",
    "Stockton-Lodi, CA", "Vallejo-Fairfield, CA", "Visalia-Porterville, CA", "Yuba City, CA",
    "Boulder, CO", "Colorado Springs, CO", "Denver-Aurora-Lakewood, CO", "Fort Collins, CO",
    "Grand Junction, CO", "Greeley, CO", "Pueblo, CO",
    "Kahului-Wailuku-Lahaina, HI", "Urban Honolulu, HI",
    "Boise City, ID", "Coeur d'Alene, ID", "Idaho Falls, ID", "Lewiston, ID-WA",
    "Logan, UT-ID", "Pocatello, ID", "Twin Falls, ID",
    "Billings, MT", "Great Falls, MT", "Missoula, MT",
    "Carson City, NV", "Las Vegas-Henderson-Paradise, NV", "Reno, NV",
    "Albuquerque, NM", "Farmington, NM", "Las Cruces, NM", "Santa Fe, NM",
    "Abilene, TX", "Amarillo, TX", "Brownsville-Harlingen, TX", "Corpus Christi, TX",
    "El Paso, TX", "Laredo, TX", "Lubbock, TX", "McAllen-Edinburg-Mission, TX",
    "Midland, TX", "Odessa, TX", "San Angelo, TX",
    "Ogden-Clearfield, UT", "Provo-Orem, UT", "St. George, UT", "Salt Lake City, UT",
    "Bellingham, WA", "Bremerton-Silverdale, WA", "Kennewick-Richland, WA",
    "Longview, WA", "Mount Vernon-Anacortes, WA", "Olympia-Tumwater, WA",
    "Seattle-Tacoma-Bellevue, WA", "Spokane-Spokane Valley, WA", "Walla Walla, WA",
    "Wenatchee, WA", "Yakima, WA",
    "Casper, WY", "Cheyenne, WY"
  ],

  "Central": [
    "Anniston-Oxford-Jacksonville, AL", "Auburn-Opelika, AL", "Birmingham-Hoover, AL",
    "Columbus, GA-AL", "Daphne-Fairhope-Foley, AL", "Decatur, AL", "Dothan, AL",
    "Florence-Muscle Shoals, AL", "Gadsden, AL", "Huntsville, AL", "Mobile, AL",
    "Montgomery, AL", "Tuscaloosa, AL",
    "Hot Springs, AR", "Jonesboro, AR", "Little Rock-North Little Rock-Conway, AR",
    "Pine Bluff, AR", "Fayetteville-Springdale-Rogers, AR-MO", "Fort Smith, AR-OK",
    "Memphis, TN-MS-AR", "Texarkana, TX-AR",
    "Bloomington, IL", "Cape Girardeau, MO-IL", "Carbondale-Marion, IL",
    "Champaign-Urbana, IL", "Chicago-Naperville-Elgin, IL-IN-WI", "Danville, IL",
    "Davenport-Moline-Rock Island, IA-IL", "Decatur, IL", "Kankakee, IL", "Peoria, IL",
    "Rockford, IL", "St. Louis, MO-IL", "Springfield, IL",
    "Ames, IA", "Cedar Rapids, IA", "Des Moines-West Des Moines, IA", "Dubuque, IA",
    "Iowa City, IA", "Omaha-Council Bluffs, NE-IA", "Sioux City, IA-NE-SD",
    "Waterloo-Cedar Falls, IA",
    "Kansas City, MO-KS", "Lawrence, KS", "Manhattan, KS", "St. Joseph, MO-KS",
    "Topeka, KS", "Wichita, KS",
    "Alexandria, LA", "Baton Rouge, LA", "Hammond, LA", "Houma-Thibodaux, LA",
    "Lafayette, LA", "Lake Charles, LA", "Monroe, LA", "New Orleans-Metairie, LA",
    "Shreveport-Bossier City, LA",
    "Duluth, MN-WI", "Fargo, ND-MN", "Grand Forks, ND-MN", "La Crosse-Onalaska, WI-MN",
    "Mankato-North Mankato, MN", "Minneapolis-St. Paul-Bloomington, MN-WI",
    "Rochester, MN", "St. Cloud, MN",
    "Gulfport-Biloxi-Pascagoula, MS", "Hattiesburg, MS", "Jackson, MS",
    "Columbia, MO", "Jefferson City, MO", "Joplin, MO", "Springfield, MO",
    "Grand Island, NE", "Lincoln, NE",
    "Bismarck, ND",
    "Enid, OK", "Lawton, OK", "Oklahoma City, OK", "Tulsa, OK",
    "Albany, OR", "Bend-Redmond, OR", "Corvallis, OR", "Eugene, OR", "Grants Pass, OR",
    "Medford, OR", "Portland-Vancouver-Hillsboro, OR-WA", "Salem, OR",
    "Rapid City, SD", "Sioux Falls, SD",
    "Austin-Round Rock, TX", "Beaumont-Port Arthur, TX", "College Station-Bryan, TX",
    "Dallas-Fort Worth-Arlington, TX", "Houston-The Woodlands-Sugar Land, TX",
    "Killeen-Temple, TX", "Longview, TX", "San Antonio-New Braunfels, TX",
    "Sherman-Denison, TX", "Tyler, TX", "Victoria, TX", "Waco, TX", "Wichita Falls, TX",
    "Appleton, WI", "Eau Claire, WI", "Fond du Lac, WI", "Green Bay, WI",
    "Janesville-Beloit, WI", "Madison, WI", "Milwaukee-Waukesha-West Allis, WI",
    "Oshkosh-Neenah, WI", "Racine, WI", "Sheboygan, WI", "Wausau, WI"
  ],

  "East Central": [
    "Cape Coral-Fort Myers, FL", "Crestview-Fort Walton Beach-Destin, FL",
    "Deltona-Daytona Beach-Ormond Beach, FL", "Gainesville, FL", "Homosassa Springs, FL",
    "Jacksonville, FL", "Lakeland-Winter Haven, FL",
    "Miami-Fort Lauderdale-West Palm Beach, FL", "Naples-Immokalee-Marco Island, FL",
    "North Port-Sarasota-Bradenton, FL", "Ocala, FL", "Orlando-Kissimmee-Sanford, FL",
    "Palm Bay-Melbourne-Titusville, FL", "Panama City, FL",
    "Pensacola-Ferry Pass-Brent, FL", "Port St. Lucie, FL", "Punta Gorda, FL",
    "Sebastian-Vero Beach, FL", "Sebring, FL", "Tallahassee, FL",
    "Tampa-St. Petersburg-Clearwater, FL", "The Villages, FL",
    "Albany, GA", "Athens-Clarke County, GA", "Atlanta-Sandy Springs-Roswell, GA",
    "Augusta-Richmond County, GA-SC", "Brunswick, GA", "Chattanooga, TN-GA",
    "Dalton, GA", "Gainesville, GA", "Hinesville, GA", "Macon, GA", "Rome, GA",
    "Savannah, GA", "Valdosta, GA", "Warner Robins, GA",
    "Bloomington, IN", "Cincinnati, OH-KY-IN", "Columbus, IN", "Elkhart-Goshen, IN",
    "Evansville, IN-KY", "Fort Wayne, IN", "Indianapolis-Carmel-Anderson, IN",
    "Kokomo, IN", "Lafayette-West Lafayette, IN", "Louisville/Jefferson County, KY-IN",
    "Michigan City-La Porte, IN", "Muncie, IN", "South Bend-Mishawaka, IN-MI",
    "Terre Haute, IN",
    "Bowling Green, KY", "Clarksville, TN-KY", "Elizabethtown-Fort Knox, KY",
    "Huntington-Ashland, WV-KY-OH", "Lexington-Fayette, KY", "Owensboro, KY",
    "Ann Arbor, MI", "Battle Creek, MI", "Bay City, MI", "Detroit-Warren-Dearborn, MI",
    "Flint, MI", "Grand Rapids-Wyoming, MI", "Jackson, MI", "Kalamazoo-Portage, MI",
    "Lansing-East Lansing, MI", "Midland, MI", "Monroe, MI", "Muskegon, MI",
    "Niles-Benton Harbor, MI", "Saginaw, MI",
    "Albany-Schenectady-Troy, NY", "Binghamton, NY",
    "Buffalo-Cheektowaga-Niagara Falls, NY", "Elmira, NY", "Glens Falls, NY",
    "Ithaca, NY", "Rochester, NY", "Syracuse, NY", "Utica-Rome, NY",
    "Watertown-Fort Drum, NY",
    "Akron, OH", "Canton-Massillon, OH", "Cleveland-Elyria, OH", "Columbus, OH",
    "Dayton, OH", "Lima, OH", "Mansfield, OH", "Springfield, OH", "Toledo, OH",
    "Weirton-Steubenville, WV-OH", "Wheeling, WV-OH",
    "Erie, PA", "Pittsburgh, PA",
    "Cleveland, TN", "Jackson, TN", "Johnson City, TN",
    "Kingsport-Bristol-Bristol, TN-VA", "Knoxville, TN", "Morristown, TN",
    "Nashville-Davidson--Murfreesboro--Franklin, TN",
    "Beckley, WV", "Charleston, WV", "Morgantown, WV", "Parkersburg-Vienna, WV"
  ],

  "East": [
    "Bridgeport-Stamford-Norwalk, CT", "Danbury, CT",
    "Hartford-West Hartford-East Hartford, CT", "New Haven, CT",
    "Norwich-New London-Westerly, CT-RI", "Springfield, MA-CT", "Waterbury, CT",
    "Worcester, MA-CT",
    "Dover, DE", "Philadelphia-Camden-Wilmington, PA-NJ-DE-MD", "Salisbury, MD-DE",
    "Washington-Arlington-Alexandria, DC-VA-MD-WV",
    "Bangor, ME", "Dover-Durham, NH-ME", "Lewiston-Auburn, ME",
    "Portland-South Portland, ME", "Portsmouth, NH-ME",
    "Cumberland, MD-WV", "Hagerstown-Martinsburg, MD-WV",
    "Barnstable Town, MA", "Boston-Cambridge-Nashua, MA-NH", "Leominster-Gardner, MA",
    "New Bedford, MA", "Pittsfield, MA", "Providence-Warwick, RI-MA",
    "Manchester, NH",
    "Allentown-Bethlehem-Easton, PA-NJ", "Atlantic City-Hammonton, NJ",
    "New York-Newark-Jersey City, NY-NJ-PA", "Ocean City, NJ", "Trenton, NJ",
    "Vineland-Bridgeton, NJ",
    "Kingston, NY",
    "Asheville, NC", "Burlington, NC", "Charlotte-Concord-Gastonia, NC-SC",
    "Durham-Chapel Hill, NC", "Fayetteville, NC", "Goldsboro, NC",
    "Greensboro-High Point, NC", "Greenville, NC", "Hickory-Lenoir-Morganton, NC",
    "Jacksonville, NC", "Myrtle Beach-Conway-North Myrtle Beach, SC-NC", "New Bern, NC",
    "Raleigh, NC", "Rocky Mount, NC", "Virginia Beach-Norfolk-Newport News, VA-NC",
    "Wilmington, NC", "Winston-Salem, NC",
    "Youngstown-Warren-Boardman, OH-PA",
    "Altoona, PA", "Bloomsburg-Berwick, PA", "Chambersburg-Waynesboro, PA",
    "East Stroudsburg, PA", "Gettysburg, PA", "Harrisburg-Carlisle, PA",
    "Johnstown, PA", "Lancaster, PA", "Lebanon, PA", "Reading, PA",
    "Scranton--Wilkes-Barre--Hazleton, PA", "State College, PA", "Williamsport, PA",
    "York-Hanover, PA",
    "Aguadilla-Isabela, PR", "Arecibo, PR", "Guayama, PR", "Mayaguez, PR",
    "Ponce, PR", "San German, PR", "San Juan-Carolina-Caguas, PR",
    "Charleston-North Charleston, SC", "Columbia, SC", "Florence, SC",
    "Greenville-Anderson-Mauldin, SC", "Hilton Head Island-Bluffton-Beaufort, SC",
    "Spartanburg, SC", "Sumter, SC",
    "Burlington-South Burlington, VT",
    "Blacksburg-Christiansburg-Radford, VA", "Charlottesville, VA",
    "Harrisonburg, VA", "Lynchburg, VA", "Richmond, VA", "Roanoke, VA",
    "Staunton-Waynesboro, VA", "Winchester, VA-WV"
  ]
};

// Statistics for each region (consolidated from previous regions)
export const regionStatistics = {
  "West": { 
    patients: 51230, // Sum of Pacific Northwest, Southwest, Northern California, Southern California, and Mountain divisions
    physicianGroups: 412,
    agencies: 178,
    activeOutcomes: 18670
  },
  "Central": {
    patients: 33120, // Sum of Southeast, South Central, Gulf Coast, Central Plains, and NEMA divisions
    physicianGroups: 276,
    agencies: 113,
    activeOutcomes: 9840
  },
  "East Central": {
    patients: 38750, // Sum of Midwest 1&2, Great Lakes, Ohio Valley, and East Central divisions
    physicianGroups: 295,
    agencies: 124,
    activeOutcomes: 10250
  },
  "East": {
    patients: 42650, // Sum of Northeast 1&2, Atlantic, New England, and Mid-Atlantic divisions
    physicianGroups: 358,
    agencies: 147,
    activeOutcomes: 12330
  }
};

// Sample statistics for each statistical area
export const statisticalAreaStatistics = {};

// Generate statistics for each statistical area
Object.entries(regionToStatisticalAreas).forEach(([region, areas]) => {
  const regionStats = regionStatistics[region];
  // Distribute the region's statistics among its statistical areas
  const areaCount = areas.length;
  
  areas.forEach((area, index) => {
    // Create slightly varied statistics for each area
    const variationFactor = 0.7 + (Math.random() * 0.6); // Between 0.7 and 1.3
    
    statisticalAreaStatistics[area] = {
      patients: Math.round(regionStats.patients / areaCount * variationFactor),
      physicianGroups: Math.round(regionStats.physicianGroups / areaCount * variationFactor),
      agencies: Math.round(regionStats.agencies / areaCount * variationFactor),
      activeOutcomes: Math.round(regionStats.activeOutcomes / areaCount * variationFactor)
    };
  });
});

// Generate a direct mapping from divisional group to statistical areas
export const divisionalGroupToStatisticalAreas = {
  "East": [],
  "East Central": [],
  "West": [],
  "Central": []
};

// Populate the direct mapping
Object.entries(divisionalGroupToRegions).forEach(([divisionalGroup, regions]) => {
  regions.forEach(region => {
    const areas = regionToStatisticalAreas[region] || [];
    divisionalGroupToStatisticalAreas[divisionalGroup] = [
      ...divisionalGroupToStatisticalAreas[divisionalGroup],
      ...areas
    ];
  });
});

export default {
  regionToDivisionalGroup,
  divisionalGroupToRegions,
  regionToStatisticalAreas,
  divisionalGroupToStatisticalAreas,
  regionStatistics,
  statisticalAreaStatistics
}; 