const PCD_DATA = [
  {
    name: 'Audi',
    slug: 'audi',
    models: [
      {
        name: 'A1',
        slug: 'a1',
        records: [
          {
            generation: '8X',
            years: '2010-2018',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET34-39',
            status: 'needs_review'
          },
          {
            generation: 'GB',
            years: '2018-2026',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'A3',
        slug: 'a3',
        records: [
          {
            generation: '8L',
            years: '1996-2003',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET32-42',
            status: 'needs_review'
          },
          {
            generation: '8P',
            years: '2003-2013',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-56',
            status: 'needs_review'
          },
          {
            generation: '8V / 8Y',
            years: '2012-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'A4',
        slug: 'a4',
        records: [
          {
            generation: 'B5',
            years: '1995-2001',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'B6 / B7',
            years: '2000-2008',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'B8 / B9',
            years: '2008-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'A5',
        slug: 'a5',
        records: [
          {
            generation: '8T / F5',
            years: '2007-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET25-35',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'A6',
        slug: 'a6',
        records: [
          {
            generation: 'C5 / C6',
            years: '1997-2011',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'C7 / C8',
            years: '2011-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Q3',
        slug: 'q3',
        records: [
          {
            generation: '8U / F3',
            years: '2011-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET33-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Q5',
        slug: 'q5',
        records: [
          {
            generation: '8R / FY',
            years: '2008-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET25-39',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'TT',
        slug: 'tt',
        records: [
          {
            generation: '8N',
            years: '1998-2006',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET30-35',
            status: 'needs_review'
          },
          {
            generation: '8J / 8S',
            years: '2006-2023',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-52',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Seat',
    slug: 'seat',
    models: [
      {
        name: 'Arona',
        slug: 'arona',
        records: [
          {
            generation: 'KJ7',
            years: '2017-2026',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET38-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Ateca',
        slug: 'ateca',
        records: [
          {
            generation: 'KH7',
            years: '2016-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Ibiza',
        slug: 'ibiza',
        records: [
          {
            generation: '6K',
            years: '1995-2002',
            market: 'EU',
            pcd: '4x100',
            centerBore: '57.1',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-38',
            status: 'needs_review'
          },
          {
            generation: '6L / 6J / KJ',
            years: '2002-2026',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Leon',
        slug: 'leon',
        records: [
          {
            generation: '1M',
            years: '1999-2006',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET32-38',
            status: 'needs_review'
          },
          {
            generation: '1P / 5F / KL',
            years: '2005-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Toledo',
        slug: 'toledo',
        records: [
          {
            generation: '1L',
            years: '1995-1999',
            market: 'EU',
            pcd: '4x100',
            centerBore: '57.1',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-38',
            status: 'needs_review'
          },
          {
            generation: '1M',
            years: '1998-2004',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET32-38',
            status: 'needs_review'
          },
          {
            generation: '5P',
            years: '2004-2009',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          },
          {
            generation: 'KG',
            years: '2012-2019',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Skoda',
    slug: 'skoda',
    models: [
      {
        name: 'Fabia',
        slug: 'fabia',
        records: [
          {
            generation: '6Y / 5J / NJ / PJ',
            years: '1999-2026',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Karoq',
        slug: 'karoq',
        records: [
          {
            generation: 'NU',
            years: '2017-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Kodiaq',
        slug: 'kodiaq',
        records: [
          {
            generation: 'NS / PS',
            years: '2016-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET34-43',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Octavia',
        slug: 'octavia',
        records: [
          {
            generation: '1U',
            years: '1996-2010',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-42',
            status: 'needs_review'
          },
          {
            generation: '1Z / 5E / NX',
            years: '2004-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Rapid',
        slug: 'rapid',
        records: [
          {
            generation: 'NH',
            years: '2012-2019',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Superb',
        slug: 'superb',
        records: [
          {
            generation: '3U / 3T / 3V',
            years: '2001-2024',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-47',
            status: 'needs_review'
          },
          {
            generation: 'NZ',
            years: '2024-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET38-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Yeti',
        slug: 'yeti',
        records: [
          {
            generation: '5L',
            years: '2009-2017',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Volkswagen',
    slug: 'volkswagen',
    models: [
      {
        name: 'Golf',
        slug: 'golf',
        records: [
          {
            generation: 'Mk3',
            years: '1995-1997',
            market: 'EU',
            pcd: '4x100',
            centerBore: '57.1',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-38',
            status: 'needs_review'
          },
          {
            generation: 'Mk4',
            years: '1997-2006',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-42',
            status: 'needs_review'
          },
          {
            generation: 'Mk5 / Mk6 / Mk7 / Mk8',
            years: '2003-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Jetta / Bora',
        slug: 'jetta-bora',
        records: [
          {
            generation: 'Mk4',
            years: '1998-2005',
            market: 'EU / US',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-42',
            status: 'needs_review'
          },
          {
            generation: 'Mk5 / Mk6 / Mk7',
            years: '2005-2026',
            market: 'EU / US',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Passat',
        slug: 'passat',
        records: [
          {
            generation: 'B5 / B5.5',
            years: '1996-2005',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'B6 / B7 / B8',
            years: '2005-2024',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET38-47',
            status: 'needs_review'
          },
          {
            generation: 'B9',
            years: '2024-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET38-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Polo',
        slug: 'polo',
        records: [
          {
            generation: '6N',
            years: '1995-2001',
            market: 'EU',
            pcd: '4x100',
            centerBore: '57.1',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-38',
            status: 'needs_review'
          },
          {
            generation: '9N / 6R / AW',
            years: '2001-2026',
            market: 'EU',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Tiguan',
        slug: 'tiguan',
        records: [
          {
            generation: '5N / AD / CT',
            years: '2007-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET33-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Touran',
        slug: 'touran',
        records: [
          {
            generation: '1T / 5T',
            years: '2003-2026',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Transporter',
        slug: 'transporter',
        records: [
          {
            generation: 'T4',
            years: '1995-2003',
            market: 'EU',
            pcd: '5x112',
            centerBore: '57.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET44-55',
            status: 'needs_review'
          },
          {
            generation: 'T5 / T6',
            years: '2003-2026',
            market: 'EU',
            pcd: '5x120',
            centerBore: '65.1',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET50-56',
            status: 'needs_review'
          }
        ]
      }
    ]
  }
];
