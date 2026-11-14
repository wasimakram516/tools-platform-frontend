import type { Guide } from "@/lib/guides/guide-types";

/**
 * Excel date serial numbers: both date systems, the 1900 leap year mistake, times, and how to
 * convert in spreadsheets and code. Numbers were checked against Microsoft's and Google's help.
 */
export const EXCEL_DATE_GUIDE: Guide = {
  faqs: [
    {
      answer:
        "45292 is how Excel stores 1 January 2024: the number of days since its starting day. The cell is formatted as a number. Format it as a date and the date appears.",
      question: "Why does Excel show 45292 instead of a date?",
    },
    {
      answer:
        "In the 1900 system, serial 1 is 1 January 1900. Because Excel also counts a 29 February 1900 that never happened, other programs use 30 December 1899 as day zero so their numbers match Excel's from March 1900 on. In the 1904 system, 1 January 1904 is day 0.",
      question: "What is day zero for Excel dates?",
    },
    {
      answer:
        "Format the cell as a date, or paste the number into the Excel Date Converter, which also handles the 1904 system and the time of day.",
      question: "How do I turn an Excel serial number into a date?",
    },
    {
      answer:
        "1,462 days, which is four years and one day. Add 1,462 to a 1904 serial number to get the 1900 serial number for the same date.",
      question: "How far apart are the 1900 and 1904 date systems?",
    },
  ],
  intro:
    "Excel stores every date as a number: the count of days from a fixed starting day. That is why a date sometimes appears as 45292, and why the same number can mean two different dates in two workbooks. This guide explains both of Excel's date systems, the leap year mistake it keeps on purpose, how times are stored, and how to convert in Excel, Google Sheets, Python, and JavaScript.",
  metaDescription:
    "Why Excel shows dates as numbers like 45292, how the 1900 and 1904 date systems differ, the 1900 leap year bug, and how to convert both ways.",
  name: "Excel date serial numbers explained",
  relatedGuides: ["jwt-claims"],
  relatedTools: ["unix-timestamp-converter", "date-difference-calculator", "add-subtract-date", "hours-worked-calculator"],
  searchTerms: ["excel date", "serial number", "1900 date system", "1904 date system", "google sheets date", "datevalue"],
  sections: [
    {
      blocks: [
        {
          kind: "paragraph",
          text: "In Excel's default system, called the 1900 date system, 1 January 1900 is day 1, 2 January 1900 is day 2, and so on. 1 January 2024 is day 45292. Excel shows that number as a date only because the cell has a date format. Change the format to General and the number is what you see.",
        },
        {
          kind: "paragraph",
          text: "Storing dates as numbers is what makes date arithmetic work. Subtracting one date from another gives the days between them, and adding 30 to a date gives the date 30 days later. The largest date Excel accepts is 31 December 9999.",
        },
        {
          caption: "Serial numbers in the 1900 date system",
          columns: ["Serial number", "Date", "Note"],
          kind: "table",
          rows: [
            ["1", "1 January 1900", "The first date Excel accepts"],
            ["59", "28 February 1900", ""],
            ["60", "29 February 1900", "A date that never existed"],
            ["61", "1 March 1900", "From here, serials match a true day count"],
            ["25569", "1 January 1970", "The start of Unix time"],
            ["36526", "1 January 2000", ""],
            ["40729", "5 July 2011", "Microsoft's own example"],
            ["45292", "1 January 2024", ""],
            ["2958465", "31 December 9999", "The last date Excel accepts"],
          ],
        },
      ],
      heading: "How Excel stores a date",
      id: "how-it-works",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "1900 was not a leap year. A year divisible by 100 is a leap year only when it is also divisible by 400, so 2000 was a leap year and 1900 was not. Excel's 1900 date system counts 29 February 1900 anyway, as serial number 60.",
        },
        {
          kind: "paragraph",
          text: "Microsoft documents this as a known issue. Lotus 1-2-3, the leading spreadsheet at the time, treated 1900 as a leap year, and Multiplan and Excel did the same so they could use the same serial numbers and open Lotus files with the right dates. Fixing it now would move almost every date in existing workbooks by a day, so it stays. [Read Microsoft's explanation](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/wrongly-assumes-1900-is-leap-year).",
        },
        {
          kind: "paragraph",
          text: "In practice this matters only for dates before 1 March 1900. From that day on, every serial number is a true count of days from 30 December 1899, which is why other programs use that day as day zero and still agree with Excel. Before it, Excel's serial numbers are one higher than a true count, and Microsoft notes that the WEEKDAY function gives wrong answers for those dates.",
        },
      ],
      heading: "The 29 February 1900 that never happened",
      id: "leap-year-bug",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "Older versions of Excel for Mac used a second system, the 1904 date system, which counts the days since 1 January 1904. In it, 1 January 1904 is day 0. The same date is always 1,462 days lower than in the 1900 system, which is four years and one leap day: 1 January 2024 is 45292 in the 1900 system and 43830 in the 1904 system.",
        },
        {
          kind: "paragraph",
          text: "All newer versions of Excel use the 1900 system by default, but a workbook keeps the system it was made with. On Windows, the setting is under File, Options, Advanced, When calculating this workbook: Use 1904 date system. On a Mac, it is under Excel, Preferences, Calculation.",
        },
        {
          kind: "paragraph",
          text: "The danger is moving dates between workbooks that use different systems. If the dates are not converted on the way, every one of them moves by four years and one day. Newer Excel for Mac converts pasted dates unless that option is turned off, but dates copied as part of a chart, or read by another program, are not converted for you.",
        },
      ],
      heading: "The 1904 date system",
      id: "1904-system",
    },
    {
      blocks: [
        {
          kind: "paragraph",
          text: "The time of day is the fraction after the decimal point: the share of the day that has passed. Noon is 0.5, 6:00 in the morning is 0.25, and 45292.75 is 6:00 in the evening on 1 January 2024. One hour is 1/24, about 0.041667, and one minute is 1/1,440 of a day.",
        },
        {
          kind: "paragraph",
          text: "A time typed on its own, such as 08:30, is stored as a fraction with no whole days: 0.354166 and so on. Formatted as a date, it shows as day zero of January 1900, which is Excel's way of saying no date at all.",
        },
        {
          kind: "paragraph",
          text: "Because times are fractions of a day, a total of more than 24 hours rolls over unless you format it as [h]:mm, which keeps counting the hours. For shifts that pass midnight, the [Hours Worked Calculator](/tools/hours-worked-calculator) works out each day and the weekly total for you.",
        },
      ],
      heading: "How times are stored",
      id: "times",
    },
    {
      blocks: [
        {
          caption: "Formulas for Excel and Google Sheets, with the date or number in cell A1",
          columns: ["To do this", "Use this formula"],
          kind: "table",
          rows: [
            ["Make a date from its parts", "=DATE(2024,1,1), which is 45292 when formatted as General"],
            ["Show a serial number as a date", "Format the cell as a date, or =TEXT(A1,\"yyyy-mm-dd\")"],
            ["Turn a date stored as text into a real date", "=DATEVALUE(A1)"],
            ["Unix seconds to an Excel date", "=A1/86400+DATE(1970,1,1)"],
            ["An Excel date to Unix seconds", "=(A1-DATE(1970,1,1))*86400"],
            ["Days between two dates", "=B1-A1"],
          ],
        },
        {
          kind: "paragraph",
          text: "The Unix formulas treat the Excel date as UTC, because Excel dates have no time zone. Watch the year in DATE too: Excel and Google Sheets add 1900 to a year below 1900, so =DATE(24,1,1) is 1 January 1924, not 2024. To check a Unix time on its own, paste it into the [Unix Timestamp Converter](/tools/unix-timestamp-converter).",
        },
        {
          kind: "paragraph",
          text: "Google Sheets stores dates the same way, but counts the days since 30 December 1899 and has no 29 February 1900. Its serial numbers match Excel's from 1 March 1900 on, so the same formulas give the same results for any modern date.",
        },
      ],
      heading: "Converting in Excel and Google Sheets",
      id: "formulas",
    },
    {
      blocks: [
        {
          kind: "code",
          label: "Python, with pandas",
          text: 'import pandas as pd\n\npd.to_datetime(45292, unit="D", origin="1899-12-30")\n# Timestamp(\'2024-01-01 00:00:00\')',
        },
        {
          kind: "code",
          label: "JavaScript",
          text: "const serial = 45292;\nconst date = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000);\n\ndate.toISOString(); // \"2024-01-01T00:00:00.000Z\"",
        },
        {
          kind: "paragraph",
          text: "Both use 30 December 1899 as day zero, which gives the right date for every serial number from 61, that is 1 March 1900, onward. For a workbook in the 1904 system, use 1 January 1904 as day zero instead. Libraries that read .xlsx files usually check the workbook's date system for you; values copied out as plain numbers carry no such setting.",
        },
      ],
      heading: "Converting in code",
      id: "code",
    },
    {
      blocks: [
        {
          kind: "list",
          items: [
            "A column of dates shows numbers such as 45292. The cells are formatted as General or Number. Format them as a date.",
            "Dates are four years and one day out. They came from a workbook in the other date system. Add or take away 1,462.",
            "Dates will not sort or calculate. They are stored as text, often after an import. Convert them with DATEVALUE, or with Data, Text to Columns.",
            "A date before 1900 stays as text. Neither date system goes back before its starting day, so earlier dates can only be stored as text.",
            "A CSV file opens with the day and the month swapped. Excel read it in your computer's regional date order. Import it with Data, From Text/CSV, or write dates as YYYY-MM-DD.",
          ],
        },
      ],
      heading: "Common problems and their fixes",
      id: "problems",
    },
  ],
  seoTitle: "Excel Date Serial Numbers Explained",
  slug: "excel-date-serial-numbers",
  sources: [
    {
      label: "Microsoft Support: Date systems in Excel",
      url: "https://support.microsoft.com/en-us/office/date-systems-in-excel-e7fe7167-48a9-4b96-bb53-5612a800b487",
    },
    {
      label: "Microsoft Learn: Excel incorrectly assumes that the year 1900 is a leap year",
      url: "https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/wrongly-assumes-1900-is-leap-year",
    },
    {
      label: "Microsoft Support: DATE function",
      url: "https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349",
    },
    { label: "Google Docs Editors Help: DATE", url: "https://support.google.com/docs/answer/3092969" },
  ],
  toolAction: "Open the Excel Date Converter",
  toolSlug: "excel-date-converter",
  updatedAt: "2026-11-14",
};
