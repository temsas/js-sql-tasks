import postgres from "postgres";

const config = {
  host: "127.0.0.1",
  user: "postgres",
  password: "",
  port: 5432,
};

// BEGIN (write your solution here)
export default async (user, roomNumber, price) => {
  const sql = postgres(config);
  try {
    await sql.begin(async (sql) => {
      const [userResult] = await sql`
        INSERT INTO users (username, phone) VALUES (${user.username}, ${user.phone})
        RETURNING id
      `;

      const userId = userResult.id;

      const [room] = await sql`
       SELECT id FROM rooms WHERE room_number = ${roomNumber} AND status = 'free'
        FOR UPDATE
      `;

      const roomId = room.id;

      if (!room) {
        throw new Error(`Комната ${roomNumber} забронирована или не существует`);
      }

      const [orderId] = await sql`
        INSERT INTO orders (user_id, room_id, price) VALUES (${userId}, ${roomId}, ${price})
        RETURNING id
      `;

      await sql`
        UPDATE rooms SET status = 'reserved' WHERE id = ${roomId}
      `;
    });
  } finally {
    await sql.end();
  }
};
// END
