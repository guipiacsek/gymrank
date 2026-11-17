// The privacy policy, at /#privacy so it opens with or without an account.
// Keep it in step with the app: a new field, service or visibility change means updating this page and its date.
export default function Privacy() {
  return (
    <div className="legal">
      <a className="ghost back" href="#">← Back to GymRank</a>
      <div className="card">
        <h1>Privacy Policy</h1>
        <p className="dim">Last updated November 17, 2026</p>

        <h3>The short version</h3>
        <p>GymRank stores what you need to track your lifts and rank them, and nothing more. We don't sell your data, show ads, use trackers or analytics, or run AI on your data. You can delete your account and everything in it at any time.</p>

        <h3>What we collect</h3>
        <ul>
          <li><b>Account:</b> your email address, a password (stored only in hashed form, never readable by us), your username, and whether you're ranked in the men's or women's division.</li>
          <li><b>Training data you log:</b> each exercise, weight, reps, sets, number of dumbbells and date, plus the estimated one-rep max worked out from them.</li>
          <li><b>Body weight</b>, if you choose to log it.</li>
        </ul>
        <p>Body weight and training records relate to your health and fitness, so we treat them as private and use them only to show you your own stats.</p>
        <p>Your browser also stores your sign-in session, your kg/lb choice and your theme on your device. These are needed for the app to work and are not used to track you.</p>

        <h3>Who can see it</h3>
        <ul>
          <li><b>Other signed-in users</b> can see your username, your division and your best estimated max for each exercise, on the leaderboards. That's all.</li>
          <li><b>Only you</b> can see your email, your individual sets and history, your body weight, your charts and your profile page.</li>
        </ul>

        <h3>Services we use</h3>
        <p>GymRank relies on three companies to run. They process your data only to provide their service to us:</p>
        <ul>
          <li><b>Supabase</b>: database and sign-in. Stores your account and everything you log.</li>
          <li><b>Vercel</b>: hosts the website. Handles standard web traffic such as your IP address when you load the page.</li>
          <li><b>Google (Gmail)</b>: sends account emails, such as email confirmation and password resets.</li>
        </ul>

        <h3>How long we keep it</h3>
        <p>Your data is kept until you delete your account. Deleting it from the Profile page permanently removes your account, lifts and body weights straight away, and takes you off every leaderboard. Copies may stay in our providers' routine backups for a short time before they expire.</p>

        <h3>Your choices and rights</h3>
        <ul>
          <li>Edit or delete any entry from its exercise page.</li>
          <li>Delete your whole account from the bottom of your Profile page.</li>
          <li>Email us to get a copy of your data, correct it, or ask anything about it. Depending on where you live (for example the EU, UK or California), you may have further rights under local law, and we'll honor them.</li>
        </ul>

        <h3>Age</h3>
        <p>GymRank is for people aged 16 and over. If you believe a younger person has an account, email us and we'll delete it.</p>

        <h3>Changes</h3>
        <p>If this policy changes, we'll update the date at the top. For significant changes, we'll tell you in the app.</p>

        <h3>Contact</h3>
        <p><a href="mailto:gymprogressnrank@gmail.com">gymprogressnrank@gmail.com</a></p>
      </div>
    </div>
  )
}
