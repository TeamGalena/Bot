const response = await fetch("http://localhost/api/health");

if (!response.ok) throw new Error(response.statusText);

type Status = {
  running: boolean;
};

const status = (await response.json()) as Status;

if (status.running !== true) throw new Error("server is not running");
