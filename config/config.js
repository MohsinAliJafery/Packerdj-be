const nodemailer = require("nodemailer");
module.exports = {
  PORT: 5000,
  mongoURL: 'mongodb://127.0.0.1:27017/PEKERDJA_DATABASE',
  transporter: nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'admin@pekerdja.co',
      pass: 'PekerdjaX2023!',
    },
  }),
  emailFrom: 'admin@pekerdja.co',
  FRONTEND_URL: 'https://pekerdja.co/',
  FRONTEND_API_URL: 'https://pekerdja.co/api/',
  TOKEN_SECRET: 'PEKERDJA_USER',
  ADMIN_TOKEN_SECRET: 'PEKERDJA_ISADMIN',
  LINKEDIN_CLIENT_ID: '77ie66t95r3zxv',
  LINKEDIN_CLIENT__SECRET: 'E9w2Zs8Krvvx4354',
  Remote_Jobs_page: 'https://pekerdja.co/public/public-dashboard/remote-jobs',
  Coaching_page: 'https://pekerdja.co/public/public-dashboard/coaching',


  SETTINGS:
  {
    "Account_Number": "110-00-1753726-4",
    "Address": "Jl. Orang Kayo Pingai, No. 11-12 Kota Jambi",
    "Bank_Account_Holder": "PT. Pekerdja Sejahtera Indonesia",
    "Bank_Branch_Name": "Bank Mandiri KCP Jambi Talang Banjar",
    "Bank_Name": "Bank Mandiri",
    "Swift_Code": "BMRIIDJA",
    "English": "https://www.youtube.com/",
    "Soft": "https://www.youtube.com/",
    "Technical": "https://www.youtube.com/",
    "Career": "https://www.youtube.com/22"
  },

  EMAILS:
    [{
      "content": "Hi {First_Name},\nWe hope this message finds you well. We wanted to reach out and acknowledge that our system has registered your recent login activity to your account. We're delighted to see you actively engaging with our platform in your job-searching journey.\nIf you encounter any questions or require assistance during your search, don't hesitate to reach out to us at info@pekerdja.com. We're here to support you in every possible way.\nIn the unlikely event that this login activity wasn't initiated by you, please notify us immediately at the same email address. Your security and privacy are of utmost importance to us, and we'll take prompt action to ensure the safety of your account.\nWishing you the best of luck in your job-seeking endeavors!\nWarm regards,\nPekerdja\n",
      "title": "Login"
    },
    {
      "content": "Hi {First_Name},\nWelcome to Pekerdja, your gateway to building and advancing your remote career from Indonesia! We are thrilled to have you onboard and look forward to assisting you in finding your dream job.\nAt Pekerdja, we offer two primary services to empower your job search:\n1.\tRemote Jobs: Discover a wide range of remote dream jobs by visiting our Remote Jobs page ({Remote_Jobs_page}).\n2.\tCoaching: Enhance your skills and prepare for your job-searching journey with the guidance of experienced coaches. Check out our Coaching page ({Coaching_page}) to find the perfect match for your needs.\nOur team is here to support you every step of the way. If you have any questions or need assistance, please don't hesitate to reach out to us at info@pekerdja.com.\nWishing you the best of luck in your job search!\nWarm regards,\nPekerdja",
      "title": "Register"
    },
    {
      "content": "Hi {First_Name},\nCongratulations on taking a significant step forward in your pursuit of your dream remote job! We are thrilled to inform you that your application for the {JOB_TITLE} opening at {COMPANY_NAME} has been received, and your {RESUME_TITLE} resume has been forwarded to the company for review.\nThe company will directly communicate with you following this stage. Typically, companies take approximately 1 – 2 weeks to carefully assess all applications before informing candidates of their selection for the next phase. It is important to note that there have been instances in the past where certain companies choose not to notify unsuccessful applicants. Therefore, if you have not received any response from a specific company after 2 weeks, it may indicate that they have proceeded with other candidates for the position.\nWe genuinely wish you the best of luck in your ongoing remote job search journey! Should you have any questions or require any assistance during this process, please do not hesitate to reach out to us. We are here to support you every step of the way.\nWarm regards,\nPekerdja\n",
      "title": "Job_Applied"
    },
    {
      "content": "Hi {First_Name},\nWe are pleased to inform you that we have successfully received your latest resume titled \"{RESUME_TITLE}\" into our system.\nWith your newly added resume, you can now proceed to apply for relevant job openings with greater confidence.\nShould you require any assistance or have any questions regarding our job application process or any other matter, please feel free to reach out to us. We are here to support you in your job search journey and make the experience as smooth as possible.\nWishing you all the best in your pursuit of your ideal job!\nWarm regards,\nPekerdja\n",
      "title": "Add_New_resume"
    },
    {
      "content": "Hi {First_Name},\nWe sincerely appreciate your decision to book a Coaching Session with {Coach_Name} at {Date} {Time}. We are excited to embark on this journey with you to enhance your skills and job-searching success.\nTo confirm and secure your booking, we kindly request you to complete the payment process using the following details:\n●\tAmount: {Price_of_the_Coaching_Session}\n●\tTransfer to: \nBank Name: {Bank_Name}\nAddress: {Address}\nBank Branch Name: {Bank_Branch_Name}\nAccount Number: {Account_Number} \nBank Account Holder: {Bank_Account_Holder}\nSwift Code: {Swift_Code}\nAs our coaching sessions are in high demand, securing your slot is crucial. We kindly ask you to finalize the payment within the next 60 minutes to guarantee your reservation. This time frame ensures that your chosen slot remains exclusively reserved for you. In case we do not receive your payment within this period, the slot will be made available to other job seekers.\nIf you encounter any issues or need any assistance during the payment process, please do not hesitate to reach out to us. We are here to support you every step of the way.\nThank you for choosing our services, and we look forward to an enriching coaching experience with you!\n\nWarm regards,\nPekerdja\n",
      "title": "Coach_Booking_Manual_Transfer"
    },
    {
      "content": "Hi {First_Name}, Please find below the details of your coaching session: ●Coach: {Name_of_the_Coach} ●Skill: {Name_of_the_Skill_chosen} ●Date: {Date} ●Time: {Time} ●Meeting Link: {MEETING_LINK}. Warm regards, Pekerdja",
      "title": "Coach_Email"
    },
    {
      "content": "Hi {First_Name},\nWe are delighted to confirm that we have received your payment for the coaching session. Your reservation is now fully secured, and you can look forward to a productive and insightful session with our esteemed coach.\nPlease find below the details of your coaching session: \n●\tCoach: {Name_of_the_Coach}\n●\tSkill: {Name_of_the_Skill_chosen}\n●\tDate: {Date}\n●\tTime: {Time}\n●\tMeeting Link: {MEETING_LINK}\nIn preparation for your coaching session, there are two essential tasks you need to complete to provide your coach with insights into your current skill level:\n1.\tPre-assessment Test Task: {Link_to_the_Pre-assessment_Test_Task}\n2.\tExpectation Survey: {Link to the Survey: https://forms.gle/HBY19xP6jJStj3y36}\nTo ensure your coach has sufficient time to evaluate your responses thoroughly before the start of your coaching session, we encourage you to complete both tasks within the next 24 hours. Your active participation in these tasks will significantly contribute to tailoring the coaching session to address your specific needs and aspirations.\nOnce again, we appreciate your trust in our coaching services, and we are confident that this session will be an enriching experience for you.\n\nWarm regards,\nPekerdja\n",
      "title": "Payment_Completion"
    }],

  ABOUT_PEKERDJA: [
    {
      "title": "About_Us",
      "content": "About_Us"
    },
    {
      "title": "Contact_Us",
      "content": "",
    },
    {
      "title": "Privacy_Policy",
      "content": "Privacy_Policy",
    },
    {
      "title": "Terms_Of_Use",
      "content": "Terms_Of_Use",
    },
    {
      "title": "Facebook_Link",
      "content": "",
    },
    {
      "title": "Instagram_Link",
      "content": "",
    },
    {
      "title": "Linkedin_Link",
      "content": "",
    }
  ]
};




