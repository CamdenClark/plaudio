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
