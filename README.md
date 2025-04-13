# Chat App Frontend

This is the frontend of the Chat App, built with **Next.js** and powered by modern web technologies. The project is designed to be scalable, efficient, and user-friendly.

## 🚀 Features
- **Real-time messaging** with WebSocket integration
- **Optimized UI/UX** with responsive design
- **Next.js framework** for server-side rendering and performance benefits
- **Redis & Kafka support** for high-performance data streaming
- **Authentication & Authorization** using JWT
- **Environment-based configurations** using `.env` files

## 🛠️ Technologies Used
- **Next.js** - React framework for optimized performance
- **TypeScript** - Ensuring type safety and better development experience
- **Tailwind CSS** - Modern utility-first CSS framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **Redis Streams** - Used for handling real-time messaging efficiently
- **Kafka** - Event-driven architecture for scalable messaging

## 📦 Installation & Setup

### Prerequisites
Make sure you have the following installed:
- **Node.js** (>= 16)
- **npm** / **yarn** / **pnpm** / **bun**
- Redis & Kafka (if using the full setup)

### Clone the Repository
```bash
git clone https://github.com/SohamChatterG/chat-app-frontend.git
cd chat-app-frontend
```

### Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Configure Environment Variables
Create a `.env.local` file and add your API base URL and other necessary configurations.
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## 🔗 Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO](https://socket.io/docs/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Redis Streams](https://redis.io/docs/data-types/streams/)


```

## 🤝 Contributing
We welcome contributions! Feel free to submit a PR or open an issue.

## 📜 License
This project is licensed under the **MIT License**.

