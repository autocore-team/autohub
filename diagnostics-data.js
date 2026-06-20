window.AUTOHUB_DIAGNOSTICS_DATA = {
  profiles: {
    fordMazda: [
      { id: 'forscan', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] },
      { id: 'obd-auto-doctor', level: 'basic', tasks: ['codes', 'live'] }
    ],
    vagOld: [
      { id: 'vcds-lite', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'vcds', level: 'alternative', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    vagModern: [
      { id: 'vcds', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'obdeleven', level: 'alternative', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'carista', level: 'alternative', tasks: ['codes', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    volvoClassic: [
      { id: 'vol-fcr', level: 'recommended', tasks: ['codes', 'live'] },
      { id: 'vida', level: 'alternative', tasks: ['codes', 'live', 'service'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    volvoModern: [
      { id: 'vida', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'vdash', level: 'alternative', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    bmw: [
      { id: 'bmw-ista', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding', 'flashing'] },
      { id: 'bimmerlink', level: 'alternative', tasks: ['codes', 'live', 'service'] },
      { id: 'bimmercode', level: 'alternative', tasks: ['coding'] },
      { id: 'carly', level: 'alternative', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    opel: [
      { id: 'op-com', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'servicebox', level: 'alternative', tasks: ['service'] },
      { id: 'carly', level: 'alternative', tasks: ['codes', 'live', 'service'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    toyota: [
      { id: 'techstream', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding', 'flashing'] },
      { id: 'obdeleven', level: 'alternative', tasks: ['codes', 'live', 'service'] },
      { id: 'carista', level: 'alternative', tasks: ['codes', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    renault: [
      { id: 'pyren', level: 'community', tasks: ['codes', 'live', 'service'] },
      { id: 'ddt4all', level: 'community', tasks: ['codes', 'live', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ],
    fca: [
      { id: 'multiecuscan', level: 'recommended', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'alfaobd', level: 'alternative', tasks: ['codes', 'live', 'service', 'coding'] },
      { id: 'car-scanner', level: 'basic', tasks: ['codes', 'live'] }
    ]
  },
  vehicles: [
    { make: 'Ford', model: 'Focus', from: 1998, to: 2025, profile: 'fordMazda' },
    { make: 'Ford', model: 'Fiesta', from: 1995, to: 2023, profile: 'fordMazda' },
    { make: 'Ford', model: 'Mondeo', from: 1996, to: 2022, profile: 'fordMazda' },
    { make: 'Ford', model: 'Kuga / Escape', from: 2008, to: 2025, profile: 'fordMazda' },
    { make: 'Ford', model: 'F-150', from: 1996, to: 2025, profile: 'fordMazda' },
    { make: 'Mazda', model: 'Mazda 3', from: 2003, to: 2025, profile: 'fordMazda' },
    { make: 'Mazda', model: 'Mazda 6', from: 2002, to: 2024, profile: 'fordMazda' },
    { make: 'Mazda', model: 'CX-5', from: 2012, to: 2025, profile: 'fordMazda' },
    { make: 'Mazda', model: 'MX-5', from: 1998, to: 2025, profile: 'fordMazda' },

    { make: 'Volkswagen', model: 'Golf', from: 1995, to: 2003, profile: 'vagOld' },
    { make: 'Volkswagen', model: 'Golf', from: 2004, to: 2025, profile: 'vagModern' },
    { make: 'Volkswagen', model: 'Passat', from: 1996, to: 2025, profile: 'vagModern' },
    { make: 'Volkswagen', model: 'Tiguan', from: 2007, to: 2025, profile: 'vagModern' },
    { make: 'Audi', model: 'A4', from: 1995, to: 2025, profile: 'vagModern' },
    { make: 'Audi', model: 'A6', from: 1995, to: 2025, profile: 'vagModern' },
    { make: 'Audi', model: 'Q5', from: 2008, to: 2025, profile: 'vagModern' },
    { make: 'Skoda', model: 'Octavia', from: 1996, to: 2025, profile: 'vagModern' },
    { make: 'Skoda', model: 'Superb', from: 2001, to: 2025, profile: 'vagModern' },
    { make: 'SEAT', model: 'Leon', from: 1999, to: 2025, profile: 'vagModern' },
    { make: 'SEAT', model: 'Ibiza', from: 1995, to: 2025, profile: 'vagModern' },

    { make: 'Volvo', model: 'S70', from: 1997, to: 2000, profile: 'volvoClassic' },
    { make: 'Volvo', model: 'V70', from: 1997, to: 2000, profile: 'volvoClassic' },
    { make: 'Volvo', model: 'V70', from: 2001, to: 2016, profile: 'volvoModern' },
    { make: 'Volvo', model: 'S60', from: 2001, to: 2025, profile: 'volvoModern' },
    { make: 'Volvo', model: 'XC60', from: 2008, to: 2025, profile: 'volvoModern' },
    { make: 'Volvo', model: 'XC90', from: 2003, to: 2025, profile: 'volvoModern' },

    { make: 'BMW', model: '3 Series', from: 1995, to: 2025, profile: 'bmw' },
    { make: 'BMW', model: '5 Series', from: 1995, to: 2025, profile: 'bmw' },
    { make: 'BMW', model: 'X3', from: 2004, to: 2025, profile: 'bmw' },
    { make: 'BMW', model: 'X5', from: 2000, to: 2025, profile: 'bmw' },
    { make: 'MINI', model: 'Hatch / Cooper', from: 2001, to: 2025, profile: 'bmw' },

    { make: 'Opel', model: 'Astra', from: 1995, to: 2025, profile: 'opel' },
    { make: 'Opel', model: 'Corsa', from: 1995, to: 2025, profile: 'opel' },
    { make: 'Opel', model: 'Insignia', from: 2008, to: 2022, profile: 'opel' },
    { make: 'Vauxhall', model: 'Astra', from: 1995, to: 2025, profile: 'opel' },
    { make: 'Vauxhall', model: 'Corsa', from: 1995, to: 2025, profile: 'opel' },

    { make: 'Toyota', model: 'Corolla', from: 1995, to: 2025, profile: 'toyota' },
    { make: 'Toyota', model: 'Camry', from: 1995, to: 2025, profile: 'toyota' },
    { make: 'Toyota', model: 'RAV4', from: 1995, to: 2025, profile: 'toyota' },
    { make: 'Toyota', model: 'Prius', from: 1997, to: 2025, profile: 'toyota' },
    { make: 'Lexus', model: 'IS', from: 1999, to: 2025, profile: 'toyota' },
    { make: 'Lexus', model: 'RX', from: 1998, to: 2025, profile: 'toyota' },

    { make: 'Renault', model: 'Clio', from: 1995, to: 2025, profile: 'renault' },
    { make: 'Renault', model: 'Megane', from: 1995, to: 2025, profile: 'renault' },
    { make: 'Renault', model: 'Scenic', from: 1996, to: 2025, profile: 'renault' },
    { make: 'Dacia', model: 'Duster', from: 2010, to: 2025, profile: 'renault' },
    { make: 'Dacia', model: 'Sandero', from: 2008, to: 2025, profile: 'renault' },

    { make: 'Fiat', model: '500', from: 2007, to: 2025, profile: 'fca' },
    { make: 'Fiat', model: 'Panda', from: 1995, to: 2025, profile: 'fca' },
    { make: 'Fiat', model: 'Ducato', from: 1995, to: 2025, profile: 'fca' },
    { make: 'Alfa Romeo', model: '159', from: 2005, to: 2011, profile: 'fca' },
    { make: 'Alfa Romeo', model: 'Giulietta', from: 2010, to: 2020, profile: 'fca' },
    { make: 'Jeep', model: 'Renegade', from: 2014, to: 2025, profile: 'fca' },
    { make: 'Jeep', model: 'Grand Cherokee', from: 1999, to: 2025, profile: 'fca' }
  ]
};
