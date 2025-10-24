import AssetsDisplay from "../components/AssetsDisplay"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function Page() {
  return (
    <>
      <Header />

      <div className="max-w-[1100px] text-center  m-auto my-20">
        <div>
          <h1 className="text-2xl md:text-5xl  mb-4">
            Stock Market
          </h1>
          <p className="text-md md:text-xl mb-2">
            Explore a growing list of real-world assets represented on-chain.
          </p>
        </div>

        <AssetsDisplay />
      </div>

      <Footer />
    </>

  );
}