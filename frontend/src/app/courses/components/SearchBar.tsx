interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="relative flex h-16 w-full items-center rounded-xl bg-white shadow-lg ring-primary/20 transition-shadow focus-within:ring-4">
        <div className="grid h-full w-16 place-items-center text-gray-400">
          <span className="material-symbols-outlined text-[28px]">search</span>
        </div>
        <input
          type="text"
          placeholder="Type here to find a course..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent pr-4 text-lg text-text-main outline-none placeholder:text-gray-400"
        />
        <button className="mr-2 h-12 rounded-lg bg-primary px-8 text-lg font-medium text-white transition-colors hover:bg-blue-600">
          Search
        </button>
      </div>
    </div>
  );
}
