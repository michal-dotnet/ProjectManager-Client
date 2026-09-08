# projectManager2 - Client (React + TypeScript + Tailwind)

## הרצה מקומית

1. ודאו שה-API רץ (פרויקט `projectManager2`, פרופיל `http`, ברירת מחדל: `http://localhost:5080`).
2. התקנת תלויות:
   ```
   npm install
   ```
3. (אופציונלי) העתיקו `.env.example` ל-`.env` ועדכנו את `VITE_API_BASE_URL` אם כתובת ה-API שונה אצלכם.
4. הרצה:
   ```
   npm run dev
   ```
5. פתחו את הדפדפן בכתובת שמודפסת בקונסול (בד"כ `http://localhost:5173`).

## הערות

- ה-API חייב לאפשר CORS למקור `http://localhost:5173` (כבר מוגדר ב-`Program.cs` של ה-API - ראו `ClientCorsPolicy`).
- הרשמה (`/register`) מאפשרת למשתמש לבחור בעצמו האם הוא Worker או Manager.
- רק Manager יכול ליצור Event חדש; רק ה-Creator של Event יכול להוסיף חברים/משימות ולסיים את האירוע.
- לקיחת משימה (Take Task) מותרת רק ל-EventMember בפועל של האירוע, וכשה-Event במצב Active.
- מזהה משתמש (User Id) להוספה כחבר אירוע נבדק כרגע ידנית דרך `GET /api/users` ב-Swagger - אין עדיין חיפוש לפי אימייל בממשק.
