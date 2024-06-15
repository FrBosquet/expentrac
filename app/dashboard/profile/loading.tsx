export default function ProfileLoading() {
  return (
    <>
      <div className="col-span-4 flex animate-pulse gap-8">
        <div className="size-48 rounded-full border border-theme-border bg-slate-400"></div>
        <div className="flex flex-1 flex-col items-start justify-center gap-2">
          <h1 className="inline-block bg-slate-400 text-5xl font-extralight uppercase text-transparent">
            loading username
          </h1>
          <p className="inline-block bg-theme-accent text-xs font-bold uppercase text-transparent">
            loading user ocupation
          </p>
          <p className="inline-block bg-theme-light text-xl text-transparent">
            loading user email
          </p>
        </div>
      </div>
    </>
  )
}
