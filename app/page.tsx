"use client"
import { Button, Input, Text, useToast } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import { useCallback, useState } from "react";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation"; 

export default function Home() {
  const [variant, setVariant] = useState<"Login" | "Register">("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacher,setTeacher] = useState("0")
  const toast = useToast();
  const router = useRouter();

  const handleToggle = useCallback(() => {
    setVariant((prev) => (prev === "Login" ? "Register" : "Login"));
  }, [setVariant]);

  const handleRegister = useCallback(async () => {
    try {
      await axios.post("/api/register", { username, email, password ,});
      toast({
        title: "Successfully Registered",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmail("");
      setPassword("");
      setUsername("");
      setTeacher("")
    }
  }, [username, email, password, toast, setEmail, setPassword, setUsername,setTeacher]);

  const handleLogin = useCallback(async () => {
    try {
      await signIn("credentials", {
        email: email,
        password: password,
      });
      router.push("/quizs");
    } catch (error) {
      console.log(error);
      toast({
        title: "Login Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [email, password, router, toast]);

  const {status} = useSession()

  if(status==='loading')
  {
    return(
      <div>
        <p>Loading</p>
      </div>
    )
  }

  if(status==='authenticated')
  {
    return redirect('/quizs')
  }

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-full h-[80vh]">
        <div className="flex flex-col gap-4 bg-[#fffff] p-10 rounded-xl shadow-lg">
          <div className="w-[300px] space-y-5 ">
            <Input
              type="text"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            {variant === "Register" && (
              <Input
                placeholder="UserName"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            )}

            <Input
              type="text"
              placeholder="Enter The Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {/* {variant==='Register' && <Input
              type="text"
              placeholder="Enter 0/1"
              onChange={(e) => setTeacher(e.target.value)}
              value={teacher}
            />} */}
          </div>
          <div className="flex flex-col gap-3">
            <Button
              w="full"
              colorScheme="whatsapp"
              onClick={variant === "Register" ? handleRegister : handleLogin}
            >
              {variant === "Login" ? "Login" : "Register"}
            </Button>
            <div>
              {variant === "Login" ? (
                <div>
                  New To Site{" "}
                  <span
                    onClick={handleToggle}
                    style={{ cursor: "pointer", color: "blue" }}
                  >
                    Register
                  </span>
                </div>
              ) : (
                <div>
                  Already Have an Account{" "}
                  <span
                    onClick={handleToggle}
                    style={{ cursor: "pointer", color: "blue" }}
                  >
                    Login
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
