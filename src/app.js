import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/students', (req, res) => {
    const students = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Bob Johnson' },
      { id: 4, name: 'Alice Brown' },
      { id: 5, name: 'Charlie Davis' },
      { id: 6, name: 'David Miller' },
      { id: 7, name: 'Emily Wilson' },
      { id: 8, name: 'Michael Brown' },
      { id: 9, name: 'Olivia Davis' },
      { id: 10, name: 'William Miller' },
      { id: 11, name: 'Sophia Wilson' },
      { id: 12, name: 'James Brown' },
      { id: 13, name: 'Emma Davis' },
      { id: 14, name: 'Alexander Miller' },
      { id: 15, name: 'Ava Wilson' },
      { id: 16, name: 'Benjamin Brown' },
      { id: 17, name: 'Isabella Davis' },
      { id: 18, name: 'Ethan Miller' }
    ]
    res.json(students)
})

const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.use(cors({
  origin : process.env.CORS_ORIGIN,
  Credentials : true
}));

app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

// Routes import
import userRouter from "./routes/user.routes.js";

app.use("/users", userRouter)


export { app }