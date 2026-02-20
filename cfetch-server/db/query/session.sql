-- name: GetSessionWithUser :one
SELECT users.id, users.email, sessions.expires
FROM sessions
JOIN users ON users.id = sessions."userId"
WHERE sessions."sessionToken" = $1;
