import { Toaster } from '@/components/ui/sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmationProvider } from '@/contexts/confirmation-context'
import { TaskDialogProvider } from '@/contexts/task-dialog-context'
import { TaskBoardLoader } from '@/components/tasks/task-board-loader'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="w-full flex-1 flex flex-col space-y-4 p-4 md:p-8 md:space-y-8 ">
        {/* greeting */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://ui.shadcn.com/avatars/03.png" alt="@shadcn" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </div>
        </div>
        {/* tasks */}
        <ConfirmationProvider>
          <TaskDialogProvider>
            <TaskBoardLoader />
            <Toaster />
          </TaskDialogProvider>
        </ConfirmationProvider>
      </main>
    </div>
  )
}
