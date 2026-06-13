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
  },
  {
    name: 'BMW',
    slug: 'bmw',
    models: [
      {
        name: '1 Series',
        slug: '1-series',
        records: [
          {
            generation: 'E81 / E82 / E87 / E88',
            years: '2004-2013',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-47',
            status: 'needs_review'
          },
          {
            generation: 'F20 / F21',
            years: '2011-2019',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET35-52',
            status: 'needs_review'
          },
          {
            generation: 'F40',
            years: '2019-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET47-57',
            status: 'needs_review'
          }
        ]
      },
      {
        name: '2 Series',
        slug: '2-series',
        records: [
          {
            generation: 'F22 / F23',
            years: '2014-2021',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET35-52',
            status: 'needs_review'
          },
          {
            generation: 'F44 / U06',
            years: '2019-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET47-57',
            status: 'needs_review'
          },
          {
            generation: 'G42',
            years: '2021-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: '3 Series',
        slug: '3-series',
        records: [
          {
            generation: 'E36',
            years: '1995-2000',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-47',
            status: 'needs_review'
          },
          {
            generation: 'E46',
            years: '1998-2006',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-50',
            status: 'needs_review'
          },
          {
            generation: 'E90 / E91 / E92 / E93',
            years: '2005-2013',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET30-47',
            status: 'needs_review'
          },
          {
            generation: 'F30 / F31 / F34',
            years: '2011-2019',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET30-47',
            status: 'needs_review'
          },
          {
            generation: 'G20 / G21',
            years: '2019-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-40',
            status: 'needs_review'
          }
        ]
      },
      {
        name: '4 Series',
        slug: '4-series',
        records: [
          {
            generation: 'F32 / F33 / F36',
            years: '2013-2020',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET30-47',
            status: 'needs_review'
          },
          {
            generation: 'G22 / G23 / G26',
            years: '2020-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-40',
            status: 'needs_review'
          }
        ]
      },
      {
        name: '5 Series',
        slug: '5-series',
        records: [
          {
            generation: 'E39',
            years: '1995-2004',
            market: 'Global',
            pcd: '5x120',
            centerBore: '74.1',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET15-25',
            status: 'needs_review'
          },
          {
            generation: 'E60 / E61',
            years: '2003-2010',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET15-35',
            status: 'needs_review'
          },
          {
            generation: 'F10 / F11',
            years: '2010-2017',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-40',
            status: 'needs_review'
          },
          {
            generation: 'G30 / G31 / G60',
            years: '2017-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-40',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'X1',
        slug: 'x1',
        records: [
          {
            generation: 'E84',
            years: '2009-2015',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET30-42',
            status: 'needs_review'
          },
          {
            generation: 'F48 / U11',
            years: '2015-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET47-57',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'X3',
        slug: 'x3',
        records: [
          {
            generation: 'E83 / F25',
            years: '2003-2017',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET35-46',
            status: 'needs_review'
          },
          {
            generation: 'G01',
            years: '2017-2024',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-45',
            status: 'needs_review'
          },
          {
            generation: 'G45',
            years: '2024-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET25-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'X5',
        slug: 'x5',
        records: [
          {
            generation: 'E53',
            years: '1999-2006',
            market: 'Global',
            pcd: '5x120',
            centerBore: '72.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET40-48',
            status: 'needs_review'
          },
          {
            generation: 'E70 / F15',
            years: '2006-2018',
            market: 'Global',
            pcd: '5x120',
            centerBore: '74.1',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET35-48',
            status: 'needs_review'
          },
          {
            generation: 'G05',
            years: '2018-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.25',
            fastener: 'bolts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    models: [
      {
        name: 'A-Class',
        slug: 'a-class',
        records: [
          {
            generation: 'W168 / W169',
            years: '1997-2012',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET35-46',
            status: 'needs_review'
          },
          {
            generation: 'W176 / W177',
            years: '2012-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET44-52',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'B-Class',
        slug: 'b-class',
        records: [
          {
            generation: 'W245',
            years: '2005-2011',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET44-49',
            status: 'needs_review'
          },
          {
            generation: 'W246 / W247',
            years: '2011-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET44-52',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'C-Class',
        slug: 'c-class',
        records: [
          {
            generation: 'W202 / W203',
            years: '1995-2007',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET31-37',
            status: 'needs_review'
          },
          {
            generation: 'W204 / W205 / W206',
            years: '2007-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-48',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'E-Class',
        slug: 'e-class',
        records: [
          {
            generation: 'W210',
            years: '1995-2002',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M12x1.5',
            fastener: 'bolts',
            offset: 'ET30-41',
            status: 'needs_review'
          },
          {
            generation: 'W211 / W212 / W213 / W214',
            years: '2002-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET35-49',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'S-Class',
        slug: 's-class',
        records: [
          {
            generation: 'W220 / W221 / W222 / W223',
            years: '1998-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET34-51',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'CLA',
        slug: 'cla',
        records: [
          {
            generation: 'C117 / C118',
            years: '2013-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET44-52',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'GLA',
        slug: 'gla',
        records: [
          {
            generation: 'X156 / H247',
            years: '2013-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET44-52',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'GLC',
        slug: 'glc',
        records: [
          {
            generation: 'X253 / X254',
            years: '2015-2026',
            market: 'Global',
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
        name: 'ML / GLE',
        slug: 'ml-gle',
        records: [
          {
            generation: 'W163',
            years: '1997-2005',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-60',
            status: 'needs_review'
          },
          {
            generation: 'W164 / W166 / V167',
            years: '2005-2026',
            market: 'Global',
            pcd: '5x112',
            centerBore: '66.6',
            thread: 'M14x1.5',
            fastener: 'bolts',
            offset: 'ET45-60',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Toyota',
    slug: 'toyota',
    models: [
      {
        name: 'Yaris',
        slug: 'yaris',
        records: [
          {
            generation: 'XP10 / XP90 / XP130 / XP210',
            years: '1999-2026',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Corolla',
        slug: 'corolla',
        records: [
          {
            generation: 'E110 / E120',
            years: '1995-2007',
            market: 'EU / Japan',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'E140 / E150 / E170',
            years: '2007-2019',
            market: 'EU / US / Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'E210',
            years: '2018-2026',
            market: 'EU / Japan',
            pcd: '5x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'E210',
            years: '2018-2026',
            market: 'US / some markets',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Camry',
        slug: 'camry',
        records: [
          {
            generation: 'XV20 / XV30 / XV40 / XV50 / XV70 / XV80',
            years: '1996-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Prius',
        slug: 'prius',
        records: [
          {
            generation: 'XW10 / XW20 / XW30 / XW50',
            years: '1997-2022',
            market: 'Global',
            pcd: '5x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'XW60',
            years: '2022-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'RAV4',
        slug: 'rav4',
        records: [
          {
            generation: 'XA10 / XA20 / XA30 / XA40 / XA50',
            years: '1995-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'C-HR',
        slug: 'c-hr',
        records: [
          {
            generation: 'AX10 / AX20',
            years: '2016-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Hilux',
        slug: 'hilux',
        records: [
          {
            generation: 'N140-N170 / AN10-AN30 / AN120-AN130',
            years: '1997-2026',
            market: 'Global',
            pcd: '6x139.7',
            centerBore: '106.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET25-35',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Land Cruiser Prado',
        slug: 'land-cruiser-prado',
        records: [
          {
            generation: 'J90 / J120 / J150 / J250',
            years: '1996-2026',
            market: 'Global',
            pcd: '6x139.7',
            centerBore: '106.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET15-30',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Honda',
    slug: 'honda',
    models: [
      {
        name: 'Civic',
        slug: 'civic',
        records: [
          {
            generation: 'EG / EK',
            years: '1995-2000',
            market: 'Global',
            pcd: '4x100',
            centerBore: '56.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'EP / EU / ES',
            years: '2001-2005',
            market: 'Global',
            pcd: '4x100',
            centerBore: '56.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'Type R / performance variants',
            years: '2001-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-60',
            status: 'needs_review'
          },
          {
            generation: 'FN / FD / FB / FK / FC / FL',
            years: '2006-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Accord',
        slug: 'accord',
        records: [
          {
            generation: 'CG / CL / CM / CU / CR / CV',
            years: '1998-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Jazz / Fit',
        slug: 'jazz-fit',
        records: [
          {
            generation: 'GD / GE / GK / GR',
            years: '2001-2026',
            market: 'Global',
            pcd: '4x100',
            centerBore: '56.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'CR-V',
        slug: 'cr-v',
        records: [
          {
            generation: 'RD / RE / RM / RW / RS',
            years: '1995-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'HR-V',
        slug: 'hr-v',
        records: [
          {
            generation: 'GH',
            years: '1998-2006',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'RU / RV',
            years: '2013-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Nissan',
    slug: 'nissan',
    models: [
      {
        name: 'Micra',
        slug: 'micra',
        records: [
          {
            generation: 'K11 / K12 / K13 / K14',
            years: '1995-2022',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '59.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Juke',
        slug: 'juke',
        records: [
          {
            generation: 'F15 / F16',
            years: '2010-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '66.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-47',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Qashqai',
        slug: 'qashqai',
        records: [
          {
            generation: 'J10 / J11 / J12',
            years: '2006-2026',
            market: 'EU / Global',
            pcd: '5x114.3',
            centerBore: '66.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'X-Trail / Rogue',
        slug: 'x-trail-rogue',
        records: [
          {
            generation: 'T30 / T31 / T32 / T33',
            years: '2000-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '66.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Leaf',
        slug: 'leaf',
        records: [
          {
            generation: 'ZE0 / ZE1',
            years: '2010-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '66.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Navara / Frontier',
        slug: 'navara-frontier',
        records: [
          {
            generation: 'D40 / D23',
            years: '2005-2026',
            market: 'Global',
            pcd: '6x114.3',
            centerBore: '66.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Mazda',
    slug: 'mazda',
    models: [
      {
        name: 'Mazda2 / Demio',
        slug: 'mazda2-demio',
        records: [
          {
            generation: 'DY / DE / DJ',
            years: '2002-2026',
            market: 'Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Mazda3',
        slug: 'mazda3',
        records: [
          {
            generation: 'BK / BL / BM / BN / BP',
            years: '2003-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Mazda6',
        slug: 'mazda6',
        records: [
          {
            generation: 'GG / GH / GJ',
            years: '2002-2024',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'CX-3',
        slug: 'cx-3',
        records: [
          {
            generation: 'DK',
            years: '2015-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'CX-5',
        slug: 'cx-5',
        records: [
          {
            generation: 'KE / KF',
            years: '2012-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'MX-5 Miata',
        slug: 'mx-5-miata',
        records: [
          {
            generation: 'NB / ND',
            years: '1998-2005 / 2015-2026',
            market: 'Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'NC',
            years: '2005-2015',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Subaru',
    slug: 'subaru',
    models: [
      {
        name: 'Impreza',
        slug: 'impreza',
        records: [
          {
            generation: 'GC / GD / GE / GH / GP / GJ',
            years: '1995-2016',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'WRX STI / performance variants',
            years: '2005-2021',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'GK / GT / GU',
            years: '2016-2026',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Forester',
        slug: 'forester',
        records: [
          {
            generation: 'SF / SG / SH / SJ',
            years: '1997-2018',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'SK / SL',
            years: '2018-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Legacy / Outback',
        slug: 'legacy-outback',
        records: [
          {
            generation: 'BD / BE / BL / BP / BM / BR',
            years: '1995-2014',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'BN / BS / BT',
            years: '2014-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'XV / Crosstrek',
        slug: 'xv-crosstrek',
        records: [
          {
            generation: 'GP / GT',
            years: '2011-2023',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          },
          {
            generation: 'GU',
            years: '2023-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'BRZ',
        slug: 'brz',
        records: [
          {
            generation: 'ZC6 / ZD8',
            years: '2012-2026',
            market: 'Global',
            pcd: '5x100',
            centerBore: '56.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Mitsubishi',
    slug: 'mitsubishi',
    models: [
      {
        name: 'Colt',
        slug: 'colt',
        records: [
          {
            generation: 'CJ / CZ / Z30',
            years: '1995-2012',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '56.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Lancer',
        slug: 'lancer',
        records: [
          {
            generation: 'CK / CS / CY',
            years: '1995-2017',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET38-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'ASX / RVR / Outlander Sport',
        slug: 'asx-rvr-outlander-sport',
        records: [
          {
            generation: 'GA / GF',
            years: '2010-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET38-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Outlander',
        slug: 'outlander',
        records: [
          {
            generation: 'CU / CW / GF / GN',
            years: '2001-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Pajero / Montero',
        slug: 'pajero-montero',
        records: [
          {
            generation: 'V20 / V60 / V80',
            years: '1995-2021',
            market: 'Global',
            pcd: '6x139.7',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET10-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'L200 / Triton',
        slug: 'l200-triton',
        records: [
          {
            generation: 'K70 / KA-KB / KK-KL / LC',
            years: '1996-2026',
            market: 'Global',
            pcd: '6x139.7',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET25-46',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Lexus',
    slug: 'lexus',
    models: [
      {
        name: 'CT',
        slug: 'ct',
        records: [
          {
            generation: 'A10',
            years: '2011-2022',
            market: 'Global',
            pcd: '5x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'IS',
        slug: 'is',
        records: [
          {
            generation: 'XE10 / XE20 / XE30',
            years: '1999-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'ES',
        slug: 'es',
        records: [
          {
            generation: 'XV20 / XV30 / XV40 / XV60 / XZ10',
            years: '1996-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'RX',
        slug: 'rx',
        records: [
          {
            generation: 'XU10 / XU30 / AL10 / AL20 / ALA10',
            years: '1998-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'NX',
        slug: 'nx',
        records: [
          {
            generation: 'AZ10 / AZ20',
            years: '2014-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'UX',
        slug: 'ux',
        records: [
          {
            generation: 'ZA10',
            years: '2018-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Suzuki',
    slug: 'suzuki',
    models: [
      {
        name: 'Swift',
        slug: 'swift',
        records: [
          {
            generation: 'HT / EZ / FZ / AZ / A2L',
            years: '1995-2026',
            market: 'Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Ignis',
        slug: 'ignis',
        records: [
          {
            generation: 'FH / MF',
            years: '2000-2026',
            market: 'Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'SX4 / S-Cross',
        slug: 'sx4-s-cross',
        records: [
          {
            generation: 'GY / JY / AKK',
            years: '2006-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Vitara / Escudo',
        slug: 'vitara-escudo',
        records: [
          {
            generation: 'ET / JT',
            years: '1998-2015',
            market: 'Global',
            pcd: '5x139.7',
            centerBore: '108.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET5-45',
            status: 'needs_review'
          },
          {
            generation: 'LY',
            years: '2015-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '60.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET45-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Jimny',
        slug: 'jimny',
        records: [
          {
            generation: 'JB / GJ',
            years: '1998-2026',
            market: 'Global',
            pcd: '5x139.7',
            centerBore: '108.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET5-22',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Hyundai',
    slug: 'hyundai',
    models: [
      {
        name: 'i10',
        slug: 'i10',
        records: [
          {
            generation: 'PA / IA / AC3',
            years: '2007-2026',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'i20',
        slug: 'i20',
        records: [
          {
            generation: 'PB / GB / BC3',
            years: '2008-2026',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'i30 / Elantra',
        slug: 'i30-elantra',
        records: [
          {
            generation: 'FD / GD / PD / CN7',
            years: '2007-2026',
            market: 'EU / US / Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Kona',
        slug: 'kona',
        records: [
          {
            generation: 'OS / SX2',
            years: '2017-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Tucson',
        slug: 'tucson',
        records: [
          {
            generation: 'JM / LM / TL / NX4',
            years: '2004-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Santa Fe',
        slug: 'santa-fe',
        records: [
          {
            generation: 'SM / CM / DM / TM / MX5',
            years: '2000-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Sonata',
        slug: 'sonata',
        records: [
          {
            generation: 'EF / NF / YF / LF / DN8',
            years: '1998-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Kia',
    slug: 'kia',
    models: [
      {
        name: 'Picanto',
        slug: 'picanto',
        records: [
          {
            generation: 'SA / TA / JA',
            years: '2004-2026',
            market: 'EU / Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Rio',
        slug: 'rio',
        records: [
          {
            generation: 'DC / JB / UB / YB',
            years: '2000-2023',
            market: 'Global',
            pcd: '4x100',
            centerBore: '54.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-46',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Ceed',
        slug: 'ceed',
        records: [
          {
            generation: 'ED / JD / CD',
            years: '2006-2026',
            market: 'EU',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Niro',
        slug: 'niro',
        records: [
          {
            generation: 'DE / SG2',
            years: '2016-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Sportage',
        slug: 'sportage',
        records: [
          {
            generation: 'JE / SL / QL / NQ5',
            years: '2004-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Sorento',
        slug: 'sorento',
        records: [
          {
            generation: 'BL / XM / UM / MQ4',
            years: '2002-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Optima / K5',
        slug: 'optima-k5',
        records: [
          {
            generation: 'MS / MG / TF / JF / DL3',
            years: '2000-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET40-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Genesis',
    slug: 'genesis',
    models: [
      {
        name: 'G70',
        slug: 'g70',
        records: [
          {
            generation: 'IK',
            years: '2017-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'G80',
        slug: 'g80',
        records: [
          {
            generation: 'DH / RG3',
            years: '2016-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'GV70',
        slug: 'gv70',
        records: [
          {
            generation: 'JK1',
            years: '2020-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'GV80',
        slug: 'gv80',
        records: [
          {
            generation: 'JX1',
            years: '2020-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '67.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET30-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Ford',
    slug: 'ford',
    models: [
      {
        name: 'Fiesta',
        slug: 'fiesta',
        records: [
          {
            generation: 'Mk4 / Mk5 / Mk6 / Mk7 / Mk8',
            years: '1995-2023',
            market: 'EU / Global',
            pcd: '4x108',
            centerBore: '63.4',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-47',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Focus',
        slug: 'focus',
        records: [
          {
            generation: 'Mk1',
            years: '1998-2004',
            market: 'EU / Global',
            pcd: '4x108',
            centerBore: '63.4',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-52',
            status: 'needs_review'
          },
          {
            generation: 'Mk2 / Mk3 / Mk4',
            years: '2004-2026',
            market: 'EU / Global',
            pcd: '5x108',
            centerBore: '63.4',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Mondeo / Fusion',
        slug: 'mondeo-fusion',
        records: [
          {
            generation: 'Mk3 / Mk4 / Mk5',
            years: '2000-2022',
            market: 'EU / US',
            pcd: '5x108',
            centerBore: '63.4',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Kuga / Escape',
        slug: 'kuga-escape',
        records: [
          {
            generation: 'C394 / C520 / CX482',
            years: '2008-2026',
            market: 'EU / US',
            pcd: '5x108',
            centerBore: '63.4',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET45-55',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Mustang',
        slug: 'mustang',
        records: [
          {
            generation: 'SN95 / New Edge',
            years: '1995-2004',
            market: 'US / Global',
            pcd: '5x114.3',
            centerBore: '70.5',
            thread: '1/2-20',
            fastener: 'nuts',
            offset: 'ET20-30',
            status: 'needs_review'
          },
          {
            generation: 'S197 / S550 / S650',
            years: '2005-2026',
            market: 'US / Global',
            pcd: '5x114.3',
            centerBore: '70.5',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-50',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'F-150',
        slug: 'f-150',
        records: [
          {
            generation: '10th gen',
            years: '1997-2003',
            market: 'US / Global',
            pcd: '5x135',
            centerBore: '87.1',
            thread: 'M14x2.0',
            fastener: 'nuts',
            offset: 'ET10-20',
            status: 'needs_review'
          },
          {
            generation: '11th-14th gen',
            years: '2004-2026',
            market: 'US / Global',
            pcd: '6x135',
            centerBore: '87.1',
            thread: 'M14x2.0',
            fastener: 'nuts',
            offset: 'ET30-44',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Ranger',
        slug: 'ranger',
        records: [
          {
            generation: 'T6 / P703',
            years: '2011-2026',
            market: 'Global',
            pcd: '6x139.7',
            centerBore: '93.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-55',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Chevrolet',
    slug: 'chevrolet',
    models: [
      {
        name: 'Spark',
        slug: 'spark',
        records: [
          {
            generation: 'M200 / M300 / M400',
            years: '2005-2022',
            market: 'Global',
            pcd: '4x100',
            centerBore: '56.6',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Aveo / Sonic',
        slug: 'aveo-sonic',
        records: [
          {
            generation: 'T200 / T250',
            years: '2002-2011',
            market: 'Global',
            pcd: '4x100',
            centerBore: '56.6',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          },
          {
            generation: 'T300',
            years: '2011-2020',
            market: 'Global',
            pcd: '5x105',
            centerBore: '56.6',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Cruze',
        slug: 'cruze',
        records: [
          {
            generation: 'J300 / D2LC',
            years: '2008-2019',
            market: 'Global',
            pcd: '5x105',
            centerBore: '56.6',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-42',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Camaro',
        slug: 'camaro',
        records: [
          {
            generation: '4th gen',
            years: '1995-2002',
            market: 'US / Global',
            pcd: '5x120.65',
            centerBore: '70.3',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-55',
            status: 'needs_review'
          },
          {
            generation: '5th / 6th gen',
            years: '2010-2024',
            market: 'US / Global',
            pcd: '5x120',
            centerBore: '66.9',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET25-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Silverado 1500',
        slug: 'silverado-1500',
        records: [
          {
            generation: 'GMT800 / GMT900 / K2XX / T1XX',
            years: '1999-2026',
            market: 'US / Global',
            pcd: '6x139.7',
            centerBore: '78.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET20-35',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Tahoe / Suburban',
        slug: 'tahoe-suburban',
        records: [
          {
            generation: 'GMT400 / GMT800 / GMT900 / K2XX / T1XX',
            years: '1995-2026',
            market: 'US / Global',
            pcd: '6x139.7',
            centerBore: '78.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET20-35',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Jeep',
    slug: 'jeep',
    models: [
      {
        name: 'Wrangler',
        slug: 'wrangler',
        records: [
          {
            generation: 'TJ',
            years: '1997-2006',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '71.5',
            thread: '1/2-20',
            fastener: 'nuts',
            offset: 'ET12-25',
            status: 'needs_review'
          },
          {
            generation: 'JK / JL',
            years: '2007-2026',
            market: 'Global',
            pcd: '5x127',
            centerBore: '71.5',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET18-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Grand Cherokee',
        slug: 'grand-cherokee',
        records: [
          {
            generation: 'ZJ',
            years: '1995-1998',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '71.5',
            thread: '1/2-20',
            fastener: 'nuts',
            offset: 'ET10-25',
            status: 'needs_review'
          },
          {
            generation: 'WJ / WK / WK2 / WL',
            years: '1999-2026',
            market: 'Global',
            pcd: '5x127',
            centerBore: '71.5',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-56',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Cherokee',
        slug: 'cherokee',
        records: [
          {
            generation: 'XJ',
            years: '1995-2001',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '71.5',
            thread: '1/2-20',
            fastener: 'nuts',
            offset: 'ET10-25',
            status: 'needs_review'
          },
          {
            generation: 'KL',
            years: '2013-2023',
            market: 'Global',
            pcd: '5x110',
            centerBore: '65.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Renegade',
        slug: 'renegade',
        records: [
          {
            generation: 'BU / BV',
            years: '2014-2026',
            market: 'Global',
            pcd: '5x110',
            centerBore: '65.1',
            thread: 'M12x1.25',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Dodge',
    slug: 'dodge',
    models: [
      {
        name: 'Charger',
        slug: 'charger',
        records: [
          {
            generation: 'LX / LD',
            years: '2006-2023',
            market: 'US / Global',
            pcd: '5x115',
            centerBore: '71.6',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET18-25',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Challenger',
        slug: 'challenger',
        records: [
          {
            generation: 'LC / LA',
            years: '2008-2023',
            market: 'US / Global',
            pcd: '5x115',
            centerBore: '71.6',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET18-25',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Durango',
        slug: 'durango',
        records: [
          {
            generation: 'DN',
            years: '1998-2003',
            market: 'US / Global',
            pcd: '6x114.3',
            centerBore: '71.6',
            thread: '1/2-20',
            fastener: 'nuts',
            offset: 'ET10-30',
            status: 'needs_review'
          },
          {
            generation: 'WD',
            years: '2011-2026',
            market: 'US / Global',
            pcd: '5x127',
            centerBore: '71.5',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-56',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Ram',
    slug: 'ram',
    models: [
      {
        name: '1500',
        slug: '1500',
        records: [
          {
            generation: 'BR / DR / DS',
            years: '1995-2018',
            market: 'US / Global',
            pcd: '5x139.7',
            centerBore: '77.8',
            thread: '9/16-18',
            fastener: 'nuts',
            offset: 'ET10-25',
            status: 'needs_review'
          },
          {
            generation: 'DT',
            years: '2019-2026',
            market: 'US / Global',
            pcd: '6x139.7',
            centerBore: '77.8',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET18-25',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Chrysler',
    slug: 'chrysler',
    models: [
      {
        name: '300',
        slug: '300',
        records: [
          {
            generation: 'LX / LD',
            years: '2005-2023',
            market: 'US / Global',
            pcd: '5x115',
            centerBore: '71.6',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET18-25',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'PT Cruiser',
        slug: 'pt-cruiser',
        records: [
          {
            generation: 'PT',
            years: '2000-2010',
            market: 'US / Global',
            pcd: '5x100',
            centerBore: '57.1',
            thread: 'M12x1.5',
            fastener: 'nuts',
            offset: 'ET35-40',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Pacifica',
        slug: 'pacifica',
        records: [
          {
            generation: 'RU',
            years: '2017-2026',
            market: 'US / Global',
            pcd: '5x127',
            centerBore: '71.5',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-51',
            status: 'needs_review'
          }
        ]
      }
    ]
  },
  {
    name: 'Tesla',
    slug: 'tesla',
    models: [
      {
        name: 'Model 3',
        slug: 'model-3',
        records: [
          {
            generation: 'Model 3',
            years: '2017-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Model Y',
        slug: 'model-y',
        records: [
          {
            generation: 'Model Y',
            years: '2020-2026',
            market: 'Global',
            pcd: '5x114.3',
            centerBore: '64.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Model S',
        slug: 'model-s',
        records: [
          {
            generation: 'Model S',
            years: '2012-2026',
            market: 'Global',
            pcd: '5x120',
            centerBore: '64.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      },
      {
        name: 'Model X',
        slug: 'model-x',
        records: [
          {
            generation: 'Model X',
            years: '2015-2026',
            market: 'Global',
            pcd: '5x120',
            centerBore: '64.1',
            thread: 'M14x1.5',
            fastener: 'nuts',
            offset: 'ET35-45',
            status: 'needs_review'
          }
        ]
      }
    ]
  }
];
