import Button from "./ui/Button";
import Icon from "./ui/Icon";

function Titlebar({ title }) {
  return (
    <>
      <header
        className={`
          p-4 border-b-1 border-border bg-bg-surface
          flex items-center justify-between
        `}
      >
        <div className={`text-2xl font-semibold`}>{title}</div>

        <div className="buttons flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              className={`bg-bg-hover p-2 hover:bg-bg-hover/70 border-1 border-border rounded-sm cursor-pointer`}
            >
              <Icon icon="search" size={20} />
            </Button>

            <Button
              className={`bg-bg-hover p-2 hover:bg-bg-hover/70 border-1 border-border rounded-sm cursor-pointer`}
            >
              <Icon icon="sun" size={20} />
            </Button>

            <Button
              className={`bg-bg-hover p-2 hover:bg-bg-hover/70 border-1 border-border rounded-sm cursor-pointer`}
            >
              <Icon icon="plus" size={20} />
            </Button>
          </div>

          <Button
            className={`
              px-4 py-3
              text-text-base bg-accent cursor-pointer
              gap-3
              hover:bg-accent-interaction
            `}
          >
            <Icon icon="upload" size={20} />
            <span>Export</span>
          </Button>
        </div>
      </header>
    </>
  );
}

export default Titlebar;
