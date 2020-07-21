export interface Bite {
  name: string;
  duration: number;
  url: string;
}

export const allBites = [
  {
    name: "metalGearAlert",
    duration: 2,
    url: "https://storage.googleapis.com/plaudio-bites/metalGearAlert.mp3",
  },
  {
    name: "militaryCountdown",
    duration: 6,
    url: "https://storage.googleapis.com/plaudio-bites/militaryCountdown.mp3",
  },
  {
    name: "militaryFire",
    duration: 1,
    url: "https://storage.googleapis.com/plaudio-bites/militaryFire.mp3",
  },
  {
    name: "natureCrickets",
    duration: 2,
    url: "https://storage.googleapis.com/plaudio-bites/natureCrickets.mp3",
  },
  {
    name: "spongebobTwoHours",
    duration: 3,
    url: "https://storage.googleapis.com/plaudio-bites/spongebobTwoHours.mp3",
  },
  {
    name: "trumpWrong",
    duration: 1,
    url: "https://storage.googleapis.com/plaudio-bites/trumpWrong.mp3",
  },
  {
    name: "XPShutdown",
    duration: 3,
    url: "https://storage.googleapis.com/plaudio-bites/XPShutdown.mp3",
  },
  {
    name: "XPStartup",
    duration: 5,
    url: "https://storage.googleapis.com/plaudio-bites/XPStartup.mp3",
  },
];

const nameToBites: Record<string, Bite> = allBites.reduce(
  (acc, current) => ({ ...acc, [current.name]: current }),
  {}
);

const nameSet = new Set(allBites.map((bite) => bite.name));

const biteToSSML = (bite: Bite): string =>
  `<audio src="${bite.url}">${bite.name}</audio>`;

export const searchBites = (searchTerm: string): Bite[] => {
  const lowerSearchTerm = searchTerm.toLocaleLowerCase();
  return allBites.filter(
    (bite) => bite.name.toLocaleLowerCase().indexOf(lowerSearchTerm) !== -1
  );
};

export const replaceBiteSSML = (text: string): string => {
  const tokens = text.split(" ");
  return tokens
    .map((token) =>
      nameSet.has(token) ? biteToSSML(nameToBites[token]) : token
    )
    .join(" ");
};
