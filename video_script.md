# 🎥 Project Presentation Script: ApexHire Portal (AccioBuild 2026)

This script is structured for a **10-minute screen recording walkthrough**. It highlights key user flows, codebase modules, and AI integrations. 

* **Tone:** Professional, energetic, and clear.
* **Language:** 90% English, 10% Hindi (indicated in parentheses).

---

## ⏱️ Timeline Breakdown

- **0:00 - 1:30** | Introduction & Welcome (Landing Page & Design Aesthetic)
- **1:30 - 4:00** | Student Dashboard, AI Resume Parser & Matchmaker, Feedback Modal
- **4:00 - 6:30** | Recruiter ATS Workspace, Pipeline status updates, Resumes directory table
- **6:30 - 8:30** | Admin Console, Recharts analytics, Coordinator settings config
- **8:30 - 9:30** | Codebase Walkthrough (Directory structure, auth middleware role configurations)
- **9:30 - 10:00** | Closing & Wrap-up

---

## 🎙️ Video Script

### 1. Introduction (0:00 - 1:30)
* **Visual on screen:** Show the landing page of **ApexHire Portal**, toggling between Light and Dark mode to show the aesthetic design.

> "Hello everyone, my name is Surjeet Kumar, and today I am extremely excited to present my final project submission for **AccioBuild 2026**—**ApexHire Portal**."
>
> *(Dosto, ye ek end-to-end Talent Analytics aur Hiring Platform hai)* designed to bridge the gap between students, recruiters, and placement admins. 
> 
> As you can see on my screen, we have built the application using a very modern, premium glassmorphic UI design language. It is fully responsive and supports a high-end theme toggle. Let's switch to Light Theme—look at how the shadows, glow effects, and transitions adapt dynamically. It looks extremely clean.
> 
> Today, I will walk you through the three core roles of this portal: **Students**, **Recruiters**, and **Placement Admins**, and show you how we integrated Google Gemini AI to build smart hiring tools. Let's dive in!"

---

### 2. Student Dashboard & AI Tools (1:30 - 4:00)
* **Visual on screen:** Log in as a Student. Show the Student Dashboard, then navigate to the **Job Board** and **My Interviews**.

> "First, let's log in as a Student candidate. Here is our student dashboard where students can manage their profiles, track registered events, and view active applications.
>
> Let's look at the **AI Resume Reviewer** tab. *(Yahan student apna PDF format me resume upload kar sakte hain).* When we upload a resume, the backend sends it to the Google Gemini API. The AI parses the skills, rates the resume from 0 to 100, and gives optimization feedback—showing matching roles and missing skills.
>
> Next, let's check the **Job Board**. When a student browses active job vacancies, they can click on the **AI Match** button. The portal compares the student's parsed profile skills with the job requirements and shows an instant match percentage scorecard. This helps students know exactly where they stand.
>
> Finally, let's look at **My Interviews**. You can see an upcoming interview scheduled for a Frontend Developer role. But notice something interesting: today's date has passed this interview date. Because the date has passed, the portal dynamically shows a green **'Mark as Completed'** button. 
>
> Let's click it. Look! A premium custom modal pops up asking: *'How did it go?'* Students can select their feeling—like 'Excellent' or 'Good', rate it out of 5 stars, and add key questions asked during the round. Let's submit. 
>
> *(Aur dekhiye, submit karte hi ye successfully 'Past Interviews' table me move ho gaya)* with complete star rating visuals and interview notes. This closes the feedback loop instantly!"

---

### 3. Recruiter Workspace & ATS Pipeline (4:00 - 6:30)
* **Visual on screen:** Log in as a Recruiter. Show the Recruiter Dashboard, the Active Stats, and the **Applicant Tracking Pipeline**.

> "Now, let's switch roles and log in as a Recruiter. Welcome to the **Recruiter Workspace**.
>
> At the top, we have our premium switch capsule to switch between the ATS Dashboard and Resumes Bank. Look at our dynamic stat cards—Active Jobs, Total Applicants, Selected Candidates, and Interviewing. Each card features left color-coded indicators and glowing icons matching our design tokens.
>
> Under the **Applicant Tracking Pipeline**, recruiters can see all candidates applied for their posted positions. Look at the AI Match badge—it pulls the matching rating directly from our AI matchmaker. Recruiters can change the status using the dropdown selector. 
>
> Let's change the status of Surjeet from 'Applied' to 'Reviewing'. *(Aur ye bina kisi error ke successfully save ho gaya)* because the dropdown options are synchronized with the backend Mongoose validation enums.
>
> Let's check the **Search Resumes** tab. Here is our database table. We upgraded this to use our `.premium-table` class. Look at the candidate names with round gradient initials, pill-shaped skill capsules, and the glowing AI resume score badges. Clicking 'View Resume' dynamically opens the file served from our backend base host depending on whether we are in local development or production.
>
> Let's open the **Post Job** modal. Look at this form layout—it is fully styled with custom borders, rounded inputs, clear label hierarchies, and a premium gradient accent line at the top. When we submit, it successfully posts to `/api/jobs`, authorized securely for recruiters."

---

### 4. Admin Dashboard & Platform Controls (6:30 - 8:30)
* **Visual on screen:** Log in as an Admin. Show the Admin dashboard charts, the Student Verification toggles, and the Coordinator settings.

> "Next, let's log in as the **Placement Admin**. 
>
> Here we have our primary metrics board and live analytics graphs built with Recharts, showing student registrations, department split, and active job postings.
>
> In the **Student Directory**, admins can verify students. Let's click **'Verify Student'**. The green badge immediately toggles, updating their profile status.
>
> Under **Ecosystem & Alumni**, admins can manage referral requests. They can approve referrals, which triggers email/in-app notifications for the candidates.
>
> Finally, in the **Settings** tab, admins can add/edit placement coordinators and configure platform thresholds like minimum CGPA or allowed branches. All these settings calls hit the dynamic API path securely."

---

### 5. Codebase Walkthrough & API (8:30 - 9:30)
* **Visual on screen:** Open VS Code showing the folder structure, backend `server.js`, and `authMiddleware.js`.

> "Let me show you how the codebase is structured. 
>
> We organized the frontend pages into role-based subdirectories: `/pages/admin/`, `/pages/recruiter/`, `/pages/student/`, and `/pages/shared/` for better maintainability.
>
> On the backend, we created a custom middleware called **`adminOrRecruiter`** in `authMiddleware.js`. *(Isse secure endpoints par recruiters aur admins dono authorization check verify kar sakte hain).*
>
> All backend routes use clean REST design patterns, and assets like resumes or offer letters are served dynamically by matching the host client port, resolving 404 connection drops."

---

### 6. Conclusion (9:30 - 10:00)
* **Visual on screen:** Show the landing page again, scrolling down to the footer.

> "To conclude, ApexHire Portal is a production-ready placement engine that optimizes talent tracking and hiring analytics. 
>
> It combines modern design principles with state-of-the-art AI parsing pipelines, making the talent matching process seamless for everyone.
>
> *(Umeed hai aapko mera project pasand aaya hoga).* Thank you so much for your time, and I look forward to your valuable feedback. Thank you!"
