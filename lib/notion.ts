import { Client } from '@notionhq/client';
import { TODAY_DB } from './globals';
import { ProgressReport, StudyActivity, StudyCategory } from './types';

const notion = new Client({ auth: process.env.NOTION_KEY });

const studyTrackerDB = process.env.NOTION_STUDY_TRACKER_DATABASE_ID as string;
const studyPostsDB = process.env.NOTION_STUDY_POSTS_DATABASE_ID as string;

function getActivityMetaData(pages: any) {
  const activities: StudyActivity[] = pages.map((page: any) => {
    return {
      id: page.id,
      // @ts-ignore
      title: page.properties.Details.title[0].plain_text,
      // @ts-ignore
      category: page.properties.Category.select.name,
      // @ts-ignore
      time: page.properties['Time (mins)'].number,
      // @ts-ignore
      media: page.properties.Rollup.rollup.array[0]?.title[0].plain_text,
      // @ts-ignore
      date: page.properties.Date.date.start,
    };
  });
  return activities;
}

export const getTodaysStudies = async () => {
  const pages = await notion.databases.query({
    database_id: studyTrackerDB,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            equals: TODAY_DB,
          },
        },
        { property: 'Time (mins)', number: { does_not_equal: 0 } },
      ],
    },
  });
  return getActivityMetaData(pages.results);
};

export const getActivityForDate = async (date: string, category: StudyCategory) => {
  const pages = await notion.databases.query({
    database_id: studyTrackerDB,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            equals: date,
          },
        },
        {
          property: 'Category',
          select: {
            equals: category,
          },
        },
      ],
    },
  });
  return getActivityMetaData(pages.results);
};

export const getActivityForMonth = async (start: string, end: string) => {
  let results = [];
  let data = await notion.databases.query({
    database_id: studyTrackerDB,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: start,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: end,
          },
        },
      ],
    },
  });
  results = [...data.results];

  while (data.has_more) {
    data = await notion.databases.query({
      database_id: studyTrackerDB,
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: start,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: end,
            },
          },
        ],
      },
      // changed api-endpoints.d.ts to allow null
      start_cursor: data.next_cursor,
    });

    results = [...results, ...data.results];
  }

  return getActivityMetaData(results);
};

export const getActivityForYear = async (start: string, end: string) => {
  let results = [];
  let data = await notion.databases.query({
    database_id: studyTrackerDB,
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            on_or_after: start,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: end,
          },
        },
      ],
    },
  });
  results = [...data.results];

  while (data.has_more) {
    data = await notion.databases.query({
      database_id: studyTrackerDB,
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: start,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: end,
            },
          },
        ],
      },
      // changed api-endpoints.d.ts to allow null
      start_cursor: data.next_cursor,
    });

    results = [...results, ...data.results];
  }

  return getActivityMetaData(results);
};

// refactor these getLast functions into one that takes a category?
export const getLastListen = async () => {
  const page = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: '聴く',
      },
    },
    page_size: 1,
  });
  return getActivityMetaData(page.results);
};

export const getLastRead = async () => {
  const page = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: '読書',
      },
    },
    page_size: 1,
  });
  return getActivityMetaData(page.results);
};

export const getLastWatch = async () => {
  const page = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: '観る',
      },
    },
    page_size: 1,
  });
  return getActivityMetaData(page.results);
};

export const getLastGame = async () => {
  const page = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: 'ゲーム',
      },
    },
    page_size: 1,
  });
  return getActivityMetaData(page.results);
};

export const getRecentGameLogs = async () => {
  const pages = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: 'ゲーム',
      },
    },
    page_size: 10,
  });
  return getActivityMetaData(pages.results);
};

export const getLastSpeaking = async () => {
  const page = await notion.databases.query({
    database_id: studyTrackerDB,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    filter: {
      property: 'Category',
      select: {
        equals: '話す',
      },
    },
    page_size: 1,
  });
  return getActivityMetaData(page.results);
};

// combine these two functions? re examine this flow
export const getProgressReports = async () => {
  const pages = await notion.databases.query({
    database_id: studyPostsDB,
    filter: {
      and: [
        {
          property: 'Type',
          select: {
            equals: 'Progress Report',
          },
        },
      ],
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });
  const allPages = pages.results;

  const metaData: ProgressReport[] = allPages.map((page) => {
    return {
      id: page.id,
      // @ts-ignore
      name: page.properties.Name.title[0].plain_text,
      // @ts-ignore
      type: page.properties.Type.select.name,
      // @ts-ignore
      date: page.properties.Date.date,
    };
  });
  return metaData;
};

export const getMonthDetails = async (id: string) => {
  const page = await notion.pages.retrieve({ page_id: id });
  return {
    id: page.id,
    // @ts-ignore
    // name: page.properties.Name.title[0].plain_text,
    // @ts-ignore
    date: page.properties.Date.date,
  };
};
