import { useState } from "react";

function Profile() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        alert("login successful");
       
    }

  return (
    <div>
      <h1>Login Form</h1><br/>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label><br/>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} /><br/>
            <label htmlFor="password">Password:</label><br/>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br/>
            <button type="submit">Submit</button><br/>
        </form>
    </div>
  );
}

export default Profile;