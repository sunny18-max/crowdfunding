const bcrypt = require('bcryptjs');
const db = require('./dbHelper');

// Common Indian first names and last names
const firstNames = [
  'Aarav', 'Aarush', 'Aaryan', 'Aayush', 'Abhinav', 'Aditya', 'Akshay', 'Aman', 'Amit', 'Anand',
  'Aniket', 'Anirudh', 'Ankit', 'Anuj', 'Anurag', 'Arjun', 'Arnav', 'Aryan', 'Ashish', 'Ayush',
  'Chirag', 'Deepak', 'Dev', 'Dhruv', 'Gaurav', 'Harsh', 'Himanshu', 'Ishan', 'Karan', 'Kartik',
  'Krishna', 'Kunal', 'Manoj', 'Mayank', 'Mohit', 'Nikhil', 'Nitin', 'Pranav', 'Prashant', 'Rahul',
  'Raj', 'Rajat', 'Rakesh', 'Rishabh', 'Rohit', 'Rohit', 'Sachin', 'Sagar', 'Sahil', 'Sandeep',
  'Sanjay', 'Saurabh', 'Shivam', 'Shubham', 'Siddharth', 'Soham', 'Somesh', 'Sourav', 'Sujit', 'Suman',
  'Suresh', 'Surya', 'Sushant', 'Tanmay', 'Tarun', 'Uday', 'Utkarsh', 'Vaibhav', 'Varun', 'Vedant',
  'Vikas', 'Vikram', 'Vikrant', 'Vimal', 'Vinay', 'Vineet', 'Vinit', 'Vipin', 'Vipul', 'Vishal',
  'Vishnu', 'Vivek', 'Yash', 'Yogesh', 'Yuvraj', 'Aarohi', 'Aarti', 'Aditi', 'Aishwarya', 'Akshita',
  'Amrita', 'Ananya', 'Anjali', 'Ankita', 'Anushka', 'Aparna', 'Archana', 'Arpita', 'Bhavana', 'Bhumika'
];

const lastNames = [
  'Patel', 'Shah', 'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Mehta', 'Reddy', 'Kumar', 'Singh',
  'Yadav', 'Jain', 'Agarwal', 'Joshi', 'Desai', 'Chauhan', 'Trivedi', 'Mishra', 'Pandey', 'Pillai',
  'Nair', 'Menon', 'Iyer', 'Narayan', 'Rao', 'Naidu', 'Gowda', 'Shetty', 'Choudhary', 'Rathore',
  'Saxena', 'Tiwari', 'Dubey', 'Chauhan', 'Bose', 'Banerjee', 'Mukherjee', 'Chatterjee', 'Ghosh', 'Das'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur',
  'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan', 'Vasai', 'Varanasi'
];

// Function to generate random Indian phone number
function generatePhoneNumber() {
  const prefixes = ['9', '8', '7', '6'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let number = '9' + prefix; // Starting with 9 or 8 or 7 or 6
  for (let i = 0; i < 8; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return `+91${number}`;
}

// Function to generate random user data
async function generateUserData(count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`;
    const password = await bcrypt.hash('password123', 10);
    const role = Math.random() > 0.8 ? 'entrepreneur' : 'investor'; // 20% entrepreneurs, 80% investors
    const wallet_balance = Math.floor(Math.random() * 10000) + 1000; // Random balance between 1000-11000
    const bio = `Hi, I'm ${firstName}, a ${role} from ${cities[Math.floor(Math.random() * cities.length)]}.`;
    const phone = generatePhoneNumber();
    const location = cities[Math.floor(Math.random() * cities.length)];
    const is_verified = Math.random() > 0.2 ? 1 : 0; // 80% verified users

    users.push({
      name,
      email,
      password,
      role,
      wallet_balance,
      bio,
      phone,
      location,
      is_verified: is_verified ? 1 : 0
    });
  }

  return users;
}

// Function to insert users into database
async function insertUsers(users) {
  try {
    await db.transaction(async () => {
      for (const user of users) {
        await db.run(
          `INSERT INTO users (name, email, password, role, wallet_balance, bio, phone, location, is_verified) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.name,
            user.email,
            user.password,
            user.role,
            user.wallet_balance,
            user.bio,
            user.phone,
            user.location,
            user.is_verified
          ]
        );
      }
    });
    console.log(`✅ Successfully inserted ${users.length} users into the database`);
  } catch (error) {
    console.error('Error inserting users:', error);
    throw error;
  }
}

// Main function to run the script
async function main() {
  try {
    console.log('Generating 100 Indian users...');
    const users = await generateUserData(100);
    console.log('Inserting users into the database...');
    await insertUsers(users);
    console.log('✅ All users added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the database connection
    require('./db').close();
  }
}

// Run the script
main();
